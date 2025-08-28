"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  RotateCcw,
  Info,
  TrendingUp,
  Calculator,
  Brain,
  ChevronRight,
  X,
  Check,
  Minus,
  Plus,
  User,
} from "lucide-react";
import { PokerGame, Card, Player, Action, Street } from "@/lib/poker/engine";
import { pushFoldSolver } from "@/lib/poker/solvers/pushFoldNash";
import { riverSolver } from "@/lib/poker/solvers/riverSolver";
import { mcts } from "@/lib/poker/solvers/mcts";
import {
  realTimeGTOSolver,
  nashPushFoldSolver,
} from "@/lib/poker/solvers/realTimeGTO";

interface GameStats {
  handsPlayed: number;
  winRate: number;
  vpip: number; // Voluntarily Put money In Pot
  pfr: number; // Pre-Flop Raise
  totalWinnings: number;
}

interface DecisionFeedback {
  action: Action;
  isGTO: boolean;
  expectedValue: number;
  explanation: string;
  evBreakdown: {
    action: Action;
    ev: number;
    gtoFrequency: number;
    isOptimal: boolean;
  }[];
}

export default function PracticeGame({
  playerName = "Player",
}: {
  playerName?: string;
}) {
  // Game state
  const [game, setGame] = useState<PokerGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStreet, setCurrentStreet] = useState<Street>("preflop");
  const [heroCards, setHeroCards] = useState<[Card, Card] | null>(null);
  const [board, setBoard] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);

  // UI state
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<DecisionFeedback | null>(
    null
  );
  const [handHistory, setHandHistory] = useState<string[]>([]);
  const [isHeroTurn, setIsHeroTurn] = useState(false);

  // Statistics
  const [stats, setStats] = useState<GameStats>({
    handsPlayed: 0,
    winRate: 0,
    vpip: 0,
    pfr: 0,
    totalWinnings: 0,
  });

  // Real-time calculations
  const [potOdds, setPotOdds] = useState<number | null>(null);
  const [equity, setEquity] = useState<number | null>(null);
  const [ev, setEV] = useState<number | null>(null);
  const [mdf, setMDF] = useState<number | null>(null);

  /**
   * Start a new hand with 3 players
   */
  const startNewHand = useCallback(() => {
    const initialPlayers: Player[] = [
      {
        id: "btn",
        name: "BTN",
        stack: 100,
        cards: [] as [],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: false,
        position: 0,
        isDealer: true, // BTN position
      },
      {
        id: "hero",
        name: playerName,
        stack: 100,
        cards: [] as [],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: true,
        position: 1,
        isSB: true, // Hero is SB (like GTO Wizard)
      },
      {
        id: "bb",
        name: "BB",
        stack: 100,
        cards: [] as [],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: false,
        position: 2,
        isBB: true, // BB position
      },
    ];

    const blinds = { sb: 0.5, bb: 1 };
    const newGame = new PokerGame(initialPlayers, blinds);
    const gameState = newGame.getState();

    setGame(newGame);
    setGameStarted(true);
    setCurrentStreet("preflop");
    setPlayers(gameState.players);

    const heroPlayer = gameState.players.find((p) => p.isHero);
    if (heroPlayer && heroPlayer.cards.length === 2) {
      setHeroCards(heroPlayer.cards as [Card, Card]);
    }

    setBoard([]);
    setPot(gameState.pot);
    setHandHistory([`New hand #${stats.handsPlayed + 1} started`]);
    setShowFeedback(false);
    setLastFeedback(null);
    setIsHeroTurn(gameState.actionOn === "hero");
    // Calculate optimal raise size based on stack depth (like GTO Wizard)
    const heroStack = gameState.players.find((p) => p.isHero)?.stack || 100;
    const effectiveStack = Math.min(
      ...gameState.players.filter((p) => !p.hasFolded).map((p) => p.stack)
    );

    let optimalRaise;
    if (effectiveStack <= 20) {
      // Short stack: min-raise or shove
      optimalRaise = gameState.currentBet * 2;
    } else if (effectiveStack <= 40) {
      // Medium stack: 2.2-2.5x
      optimalRaise = gameState.currentBet * 2.2;
    } else {
      // Deep stack: 2.5-3x
      optimalRaise = gameState.currentBet * 2.5;
    }
    setBetAmount(Math.round(optimalRaise)); // Set to optimal GTO size

    // Update stats
    setStats((prev) => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
    }));

    // Calculate initial values
    updateCalculations(newGame);

    // If it's not hero's turn, make bot act
    if (gameState.actionOn !== "hero") {
      setTimeout(() => botAction(newGame), 1500);
    }
  }, [stats.handsPlayed, playerName]);

  /**
   * Update real-time calculations
   */
  const updateCalculations = useCallback((gameInstance: PokerGame) => {
    const state = gameInstance.getState();
    const hero = state.players.find((p) => p.isHero);
    if (!hero || hero.hasFolded) {
      setPotOdds(null);
      setMDF(null);
      setEquity(null);
      setEV(null);
      return;
    }

    // Calculate pot odds - the percentage of the total pot we need to call
    const toCall = state.currentBet - hero.currentBet;
    if (toCall > 0) {
      // Pot odds = amount to call / (pot after calling)
      // This tells us the minimum equity we need to make a profitable call
      const totalPot = state.pot + toCall;
      const potOddsValue = (toCall / totalPot) * 100;
      setPotOdds(potOddsValue);

      // Calculate MDF (Minimum Defense Frequency)
      const mdfValue = riverSolver.calculateMDF(toCall, state.pot) * 100;
      setMDF(mdfValue);
    } else {
      setPotOdds(null);
      setMDF(null);
    }

    // Calculate equity based on hand strength
    if (hero.cards && hero.cards.length === 2) {
      const card1Rank = getRankValue(hero.cards[0][0] as any);
      const card2Rank = getRankValue(hero.cards[1][0] as any);
      const isPair = hero.cards[0][0] === hero.cards[1][0];
      const isSuited = hero.cards[0][1] === hero.cards[1][1];

      // More realistic preflop equity calculations
      let baseEquity = 0.33; // Start at 33% (average for 3 players)

      // Adjust for hand strength
      if (isPair) {
        if (card1Rank >= 12) baseEquity = 0.75; // AA, KK, QQ
        else if (card1Rank >= 10) baseEquity = 0.65; // JJ, TT
        else if (card1Rank >= 8) baseEquity = 0.55; // 99, 88
        else baseEquity = 0.5; // Lower pairs
      } else {
        // High cards
        if (card1Rank === 14 && card2Rank >= 11) {
          // Ace-high
          baseEquity = isSuited ? 0.55 : 0.5;
        } else if (card1Rank >= 12 && card2Rank >= 10) {
          // Broadway
          baseEquity = isSuited ? 0.48 : 0.43;
        } else if (card1Rank + card2Rank >= 20) {
          // Medium-high
          baseEquity = isSuited ? 0.4 : 0.35;
        } else {
          baseEquity = isSuited ? 0.32 : 0.28; // Low cards
        }
      }

      // Adjust for street and board texture
      if (state.board.length === 3) {
        // Flop
        // Add some variance based on board interaction (simplified)
        baseEquity = Math.max(
          0.05,
          Math.min(0.95, baseEquity + (Math.random() - 0.5) * 0.15)
        );
      } else if (state.board.length === 4) {
        // Turn
        baseEquity = Math.max(
          0.02,
          Math.min(0.98, baseEquity + (Math.random() - 0.5) * 0.1)
        );
      } else if (state.board.length === 5) {
        // River
        baseEquity = Math.max(
          0,
          Math.min(1, baseEquity + (Math.random() - 0.5) * 0.08)
        );
      }

      setEquity(baseEquity * 100);

      // Calculate EV
      if (toCall > 0) {
        const evValue = baseEquity * (state.pot + toCall) - toCall;
        setEV(evValue);
      } else {
        setEV(null);
      }
    }
  }, []);

  /**
   * Bot makes a decision using our solvers
   */
  const botAction = useCallback(
    (gameInstance: PokerGame) => {
      const state = gameInstance.getState();
      const currentBot = state.players.find((p) => p.id === state.actionOn);

      if (!currentBot || currentBot.isHero) {
        return;
      }

      let action: Action =
        state.currentBet > currentBot.currentBet ? "fold" : "check";
      let amount: number | undefined;

      try {
        // Use real GTO solver for bot decisions
        const gtoStrategy = realTimeGTOSolver.getGTOStrategy(
          state,
          currentBot.id
        );

        if (gtoStrategy.length > 0) {
          // Sample action from GTO mixed strategy
          const random = Math.random();
          let cumProb = 0;

          for (const { action: gtoAction, frequency } of gtoStrategy) {
            cumProb += frequency;
            if (random < cumProb) {
              action = gtoAction;
              break;
            }
          }

          // if no action picked use highest EV one
          if (!action && gtoStrategy.length > 0) {
            action = gtoStrategy[0].action;
          }
        } else {
          // fallback if no GTO strategy
          console.warn(
            `No GTO strategy for ${currentBot.name}, using fallback`
          );
          action = "check";
        }
      } catch (error) {
        console.error(`GTO solver error for ${currentBot.name}:`, error);
        // Fallback to simple strategy if GTO solver fails
        const random = Math.random();
        const toCall = state.currentBet - currentBot.currentBet;

        // Fallback strategy for BTN and blinds
        // BTN should be more aggressive, blinds more defensive
        const isBtn = currentBot.isDealer;
        const isBB = currentBot.isBB;

        if (toCall === 0) {
          // No bet to call
          if (isBtn || isBB) {
            action = random < 0.6 ? "check" : "bet";
          } else {
            action = random < 0.7 ? "check" : "bet";
          }
        } else {
          // Facing a bet/raise
          if (isBtn) {
            // BTN should play tighter but more aggressive when playing
            if (random < 0.3) action = "fold";
            else if (random < 0.7) action = "call";
            else action = "raise";
          } else {
            // Blinds defend more
            if (random < 0.35) action = "fold";
            else if (random < 0.8) action = "call";
            else action = "raise";
          }
        }
      }

      // Make sure we have a valid action
      if (!action) {
        action = state.currentBet > currentBot.currentBet ? "fold" : "check";
      }

      // Execute bot action
      const legalActions = gameInstance.getLegalActions(currentBot.id);
      if (!legalActions.includes(action)) {
        action = legalActions[0]; // Fallback to first legal action
        if (!action) {
          return;
        }
      }

      // Calculate bet/raise sizing
      const potSize = state.pot;
      if (action === "bet") {
        amount = potSize * 0.66;
      } else if (action === "raise") {
        // Proper raise sizing - minimum is 2x current bet
        const minRaise = state.currentBet * 2;
        amount = Math.max(minRaise, state.currentBet + potSize * 0.66);
      }

      const actionSuccess = gameInstance.executeAction(
        currentBot.id,
        action,
        amount
      );
      if (!actionSuccess) {
        return;
      }

      // Update UI
      const newState = gameInstance.getState();
      console.log(
        "After bot action - next player:",
        newState.actionOn,
        "street:",
        newState.street
      );
      setPlayers(newState.players);
      setPot(newState.pot);
      setCurrentStreet(newState.street);
      setBoard(newState.board);
      setHandHistory((prev) => [
        ...prev,
        `${currentBot.name} ${action}${amount ? ` $${amount.toFixed(2)}` : ""}`,
      ]);

      // Check if hand is over
      if (!newState.actionOn || newState.actionOn === "") {
        // Hand is over - display winner and auto-start new hand
        setIsHeroTurn(false);
        setHandHistory((prev) => [...prev, "--- Hand Complete ---"]);
        // Auto-start new hand after 2 seconds
        setTimeout(() => startNewHand(), 2000);
        return;
      }

      // Check if it's hero's turn now
      if (newState.actionOn === "hero") {
        setIsHeroTurn(true);
        updateCalculations(gameInstance);
      } else if (newState.actionOn !== "hero") {
        // Another bot's turn
        setTimeout(() => botAction(gameInstance), 1500);
      }
    },
    [updateCalculations, startNewHand]
  );

  /**
   * Handle hero action
   */
  const handleAction = useCallback(
    (action: Action, amount?: number) => {
      if (!game || !isHeroTurn) {
        return;
      }

      // Generate GTO feedback with EV breakdown BEFORE executing the action
      const stateBeforeAction = game.getState();
      const evBreakdown = calculateEVBreakdown(game, stateBeforeAction);
      const optimalAction = evBreakdown.reduce((best, current) =>
        current.ev > best.ev ? current : best
      );

      // Check if this is actually a GTO play
      const playerAction = evBreakdown.find((a) => a.action === action);
      const isOptimalPlay = playerAction?.isOptimal || false;
      const hasPositiveFreq = playerAction && playerAction.gtoFrequency > 5; // At least 5% frequency to be considered GTO
      const isGTOPlay = isOptimalPlay || hasPositiveFreq;

      const feedback: DecisionFeedback = {
        action,
        isGTO: isGTOPlay,
        expectedValue: playerAction?.ev || 0,
        explanation: isOptimalPlay
          ? `Perfect! This is the highest EV play with ${playerAction.ev.toFixed(
              2
            )} BB expected value (played ${
              playerAction.gtoFrequency
            }% in GTO strategy)`
          : hasPositiveFreq
          ? `Good mixed strategy play! EV: ${playerAction.ev.toFixed(
              2
            )} BB (GTO frequency: ${playerAction.gtoFrequency}%)`
          : `Suboptimal. The best play is ${
              optimalAction.action
            } with EV of ${optimalAction.ev.toFixed(
              2
            )} BB. Your ${action} has EV of ${
              playerAction?.ev.toFixed(2) || "0.00"
            } BB`,
        evBreakdown,
      };
      setLastFeedback(feedback);
      setShowFeedback(true);

      const success = game.executeAction("hero", action, amount);
      if (!success) {
        return;
      }

      const state = game.getState();
      setPlayers(state.players);
      setPot(state.pot);
      setCurrentStreet(state.street);
      setBoard(state.board);
      setIsHeroTurn(false);
      setSelectedAction(null);
      setHandHistory((prev) => [
        ...prev,
        `You ${action}${amount ? ` $${amount.toFixed(2)}` : ""}`,
      ]);

      // Check if hand is over
      if (!state.actionOn || state.actionOn === "") {
        // Hand is over
        setIsHeroTurn(false);
        setHandHistory((prev) => [...prev, "--- Hand Complete ---"]);
        // Auto-start new hand after 2 seconds
        setTimeout(() => startNewHand(), 2000);
        return;
      }

      // Check for next action
      if (state.actionOn !== "hero") {
        setTimeout(() => botAction(game), 1500);
      }
    },
    [game, isHeroTurn, botAction, startNewHand]
  );

  const getRankValue = (rank: string): number => {
    const values: Record<string, number> = {
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      T: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };
    return values[rank] || 0;
  };

  /**
   * Calculate EV for all possible actions using REAL GTO
   */
  const calculateEVBreakdown = (gameInstance: PokerGame, state: any): any[] => {
    const hero = state.players.find((p: Player) => p.isHero);
    if (!hero || !hero.cards || hero.cards.length !== 2) return [];

    try {
      // Use real GTO solver for accurate calculations
      const gtoStrategy = realTimeGTOSolver.getGTOStrategy(state, hero.id);
      console.log("GTO strategy for hero:", gtoStrategy);

      if (gtoStrategy.length > 0) {
        // Convert GTO strategy to our format
        const breakdown = gtoStrategy.map(({ action, frequency, ev }) => ({
          action,
          ev,
          gtoFrequency: Math.round(frequency * 100),
          isOptimal: false, // Will be set below
        }));

        // Mark the highest EV action as optimal
        const maxEV = Math.max(...breakdown.map((b) => b.ev));
        breakdown.forEach((item) => {
          item.isOptimal = Math.abs(item.ev - maxEV) < 0.001;
        });

        // Ensure fold is always an option with correct EV
        if (!breakdown.find((b) => b.action === "fold")) {
          const hero = state.players.find((p: Player) => p.isHero);
          breakdown.push({
            action: "fold",
            ev: hero ? -hero.totalInvested : 0,
            gtoFrequency: 0,
            isOptimal: false,
          });
        }

        return breakdown;
      }
    } catch (error) {}

    // Fallback to heuristic-based calculations if GTO solver fails
    return calculateEVBreakdownHeuristic(gameInstance, state);
  };

  /**
   * Heuristic-based EV calculation (fallback)
   */
  const calculateEVBreakdownHeuristic = (
    gameInstance: PokerGame,
    state: any
  ): any[] => {
    const hero = state.players.find((p: Player) => p.isHero);
    if (!hero || !hero.cards || hero.cards.length !== 2) return [];

    const pot = state.pot;
    const toCall = state.currentBet - hero.currentBet;

    // Calculate actual hand strength more accurately
    const card1Rank = getRankValue(hero.cards[0][0] as any);
    const card2Rank = getRankValue(hero.cards[1][0] as any);
    const isPair = hero.cards[0][0] === hero.cards[1][0];
    const isSuited = hero.cards[0][1] === hero.cards[1][1];
    const isConnected = Math.abs(card1Rank - card2Rank) === 1;
    const hasAce = card1Rank === 14 || card2Rank === 14;
    const hasKing = card1Rank === 13 || card2Rank === 13;
    const highCard = Math.max(card1Rank, card2Rank);
    const lowCard = Math.min(card1Rank, card2Rank);

    // More realistic preflop equity calculations for 3 players
    let baseEquity = 0.33; // Start at 33% (average for 3 players)

    if (isPair) {
      // Pocket pairs
      if (card1Rank >= 12) baseEquity = 0.7; // QQ+
      else if (card1Rank >= 10) baseEquity = 0.6; // TT-JJ
      else if (card1Rank >= 8) baseEquity = 0.5; // 88-99
      else if (card1Rank >= 5) baseEquity = 0.45; // 55-77
      else baseEquity = 0.4; // 22-44
    } else if (hasAce) {
      // Ace-high hands
      if (lowCard >= 10) baseEquity = isSuited ? 0.5 : 0.45; // AT+
      else if (lowCard >= 7) baseEquity = isSuited ? 0.4 : 0.35; // A7-A9
      else baseEquity = isSuited ? 0.35 : 0.3; // A2-A6
    } else if (hasKing && lowCard >= 10) {
      // King-high broadway
      baseEquity = isSuited ? 0.42 : 0.37;
    } else if (highCard >= 10 && lowCard >= 10) {
      // Broadway cards
      baseEquity = isSuited ? 0.4 : 0.35;
    } else if (isConnected && isSuited) {
      // Suited connectors
      if (highCard >= 9) baseEquity = 0.35;
      else baseEquity = 0.3;
    } else if (highCard <= 9 && lowCard <= 7) {
      // Weak hands like 93o
      baseEquity = isSuited ? 0.25 : 0.2;
    } else {
      // Other hands
      baseEquity = isSuited ? 0.3 : 0.25;
    }

    const equityDecimal = baseEquity;

    const breakdown = [];

    // Calculate fold EV - we lose what we've already invested
    const foldEV = -hero.totalInvested;
    breakdown.push({
      action: "fold",
      ev: foldEV,
      gtoFrequency: 10,
      isOptimal: false,
    });

    // Calculate call EV
    if (toCall > 0) {
      // EV = (equity * total pot after calling) - amount to call
      const totalPotAfterCall = pot + toCall;
      const callEV = equityDecimal * totalPotAfterCall - toCall;

      // Adjust frequency based on hand strength and pot odds
      const potOdds = toCall / (pot + toCall);
      let callFreq = 30;

      if (equityDecimal > potOdds) {
        callFreq = 50 + Math.round((equityDecimal - potOdds) * 100);
      } else if (equityDecimal < potOdds * 0.8) {
        callFreq = 5;
      }

      breakdown.push({
        action: "call",
        ev: callEV,
        gtoFrequency: Math.min(60, Math.max(0, callFreq)),
        isOptimal: false,
      });
    }

    // Calculate check EV (only postflop or BB preflop with no raise)
    if (
      toCall === 0 &&
      (state.street !== "preflop" || (hero.isBB && state.currentBet === 1))
    ) {
      const checkEV = equityDecimal * pot;
      breakdown.push({
        action: "check",
        ev: checkEV,
        gtoFrequency: 40,
        isOptimal: false,
      });
    }

    // Calculate raise/bet EV
    const isPreflop = state.street === "preflop";
    const actionName = toCall > 0 ? "raise" : isPreflop ? "raise" : "bet";

    const minRaise = state.currentBet * 2 || 2;
    const raiseSize =
      toCall > 0
        ? Math.max(minRaise, state.currentBet + pot * 0.66)
        : Math.max(pot * 0.66, 2);
    const raiseCost = raiseSize - hero.currentBet;

    if (hero.stack >= raiseCost && raiseCost > 0) {
      let foldEquity = 0.3;

      const raiseToPotRatio = raiseCost / pot;
      if (raiseToPotRatio > 1) {
        foldEquity += 0.1;
      } else if (raiseToPotRatio < 0.5) {
        foldEquity -= 0.1;
      }

      if (baseEquity > 0.5) {
        foldEquity -= 0.05;
      } else if (baseEquity < 0.25) {
        foldEquity -= 0.1;
      }

      foldEquity = Math.max(0.1, Math.min(0.6, foldEquity));

      const futurePot = pot + raiseCost * 2; // Assume one caller
      const raiseEV =
        foldEquity * pot +
        (1 - foldEquity) * (equityDecimal * futurePot - raiseCost);

      let raiseFreq = 15;

      if (baseEquity > 0.6) {
        raiseFreq = 60 + Math.round(raiseEV * 10);
      } else if (baseEquity > 0.45) {
        raiseFreq = 35 + Math.round(raiseEV * 5);
      } else if (baseEquity > 0.35) {
        raiseFreq = 20 + Math.round(raiseEV * 3);
      } else if (raiseEV > 0.5) {
        raiseFreq = 10;
      } else {
        raiseFreq = 3;
      }

      raiseFreq = Math.max(0, Math.min(80, raiseFreq));

      breakdown.push({
        action: actionName,
        ev: raiseEV,
        gtoFrequency: raiseFreq,
        isOptimal: false,
      });
    }

    // Mark only the single highest EV action as optimal
    const maxEV = Math.max(...breakdown.map((b) => b.ev));
    breakdown.forEach((item) => {
      item.isOptimal = false; // Reset all first
    });
    // Find and mark only the highest EV action
    const bestAction = breakdown.find(
      (item) => Math.abs(item.ev - maxEV) < 0.001
    );
    if (bestAction) {
      bestAction.isOptimal = true;
    }

    const totalFreq = breakdown.reduce(
      (sum, item) => sum + item.gtoFrequency,
      0
    );
    if (totalFreq > 0) {
      breakdown.forEach((item) => {
        item.gtoFrequency = Math.round((item.gtoFrequency / totalFreq) * 100);
      });
    }

    return breakdown;
  };

  const getCardColor = (card: Card): string => {
    const suit = card[1];
    return suit === "♥" || suit === "♦" ? "text-red-500" : "text-black";
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0a0b] to-black">
      {/* Header Bar */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold">Practice Mode - 3 Players</h2>

            {/* Stats Display */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Hands:</span>
                <span className="font-semibold">{stats.handsPlayed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Win Rate:</span>
                <span
                  className={`font-semibold ${
                    stats.winRate >= 50 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stats.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">P/L:</span>
                <span
                  className={`font-semibold ${
                    stats.totalWinnings >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stats.totalWinnings >= 0 ? "+" : ""}
                  {stats.totalWinnings.toFixed(2)} BB
                </span>
              </div>
            </div>
          </div>

          {gameStarted && (
            <button
              onClick={startNewHand}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-semibold flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              New Hand
            </button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Game Table */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!gameStarted ? (
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">Ready to Practice?</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Play against two GTO bots that use real game theory algorithms
                including CFR and MCTS
              </p>
              <div className="flex justify-center">
                <button
                  onClick={startNewHand}
                  className="!px-10 !py-2 bg-gradient-to-r from-green-600 to-green-700 
                hover:from-green-700 hover:to-green-800 rounded-xl 
                font-bold text-base flex items-center gap-2"
                >
                  <Play />
                  Start First Hand
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-6xl mx-auto">
              {/* Table with Players */}
              <div className="relative mb-40">
                {/* Poker Table */}
                <div className={"relative h-[440px] pb-44 -mt-5"}>
                  <div className="absolute inset-4 rounded-[120px] bg-gradient-to-br from-green-900/40 to-green-950/40 border-8 border-amber-900/50 shadow-2xl">
                    {/* Table felt texture */}
                    <div className="absolute inset-0 rounded-[112px] opacity-30 bg-gradient-to-br from-transparent via-green-800/20 to-transparent" />

                    {/* Pot Display - Positioned above cards */}
                    <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20">
                      <div className="px-6 py-3 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-yellow-600/50 shadow-xl">
                        <div className="text-xs text-yellow-500 uppercase tracking-wider mb-1">
                          Total Pot
                        </div>
                        <div className="text-3xl font-bold text-yellow-400">
                          ${(pot || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Community Cards - Positioned lower */}
                    <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 z-10">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`w-16 h-24 rounded-lg shadow-lg transform transition-all ${
                            board[i]
                              ? "bg-white border-2 border-gray-300 flex items-center justify-center"
                              : "bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-blue-700"
                          }`}
                        >
                          {board[i] && (
                            <span
                              className={`text-3xl font-bold ${getCardColor(
                                board[i]
                              )}`}
                            >
                              {board[i]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Dealer Button - positioned near BTN (top right) */}
                    {players.length > 0 && (
                      <div className="absolute top-[20%] right-[15%] w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg">
                        D
                      </div>
                    )}
                  </div>

                  {/* Players positioned around the table */}
                  {/* Top Left Player (BB) */}
                  {players[2] && !players[2].isHero && (
                    <div className="absolute top-8 left-8">
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-2">
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-900 to-indigo-950 border-2 border-indigo-600 flex items-center justify-center mb-2 shadow-xl">
                          <Brain className="w-10 h-10 text-indigo-400" />
                        </div>
                        <div className="text-sm font-semibold">
                          {players[2].name}
                        </div>
                        <div className="text-xs text-yellow-500 font-bold">
                          BB
                        </div>
                        <div className="text-sm text-gray-400">
                          ${players[2].stack.toFixed(2)}
                        </div>
                        {players[2].hasFolded && (
                          <div className="text-xs text-red-500 mt-1">
                            FOLDED
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Top Right Player (BTN) */}
                  {players[0] && !players[0].isHero && (
                    <div className="absolute top-8 right-8">
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-2">
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900 to-purple-950 border-2 border-purple-600 flex items-center justify-center mb-2 shadow-xl">
                          <Brain className="w-10 h-10 text-purple-400" />
                        </div>
                        <div className="text-sm font-semibold">
                          {players[0].name}
                        </div>
                        <div className="text-xs text-yellow-500 font-bold">
                          BTN
                        </div>
                        <div className="text-sm text-gray-400">
                          ${players[0].stack.toFixed(2)}
                        </div>
                        {players[0].hasFolded && (
                          <div className="text-xs text-red-500 mt-1">
                            FOLDED
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom Player (Hero - SB) - positioned at bottom edge of table */}
                  {players[1] && players[1].isHero && (
                    <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-900 to-green-950 border-3 border-green-500 flex items-center justify-center mb-2 shadow-xl">
                          <User className="w-10 h-10 text-green-400" />
                        </div>
                        <div className="text-sm font-semibold text-green-400">
                          {players[1].name}
                        </div>
                        <div className="text-xs text-yellow-500 font-bold">
                          SB
                        </div>
                        <div className="text-sm text-gray-400">
                          ${players[1].stack.toFixed(2)}
                        </div>
                        {players[1].hasFolded && (
                          <div className="text-xs text-red-500 mt-1">
                            FOLDED
                          </div>
                        )}

                        {/* Hero Cards - positioned directly under the hero info */}
                        {heroCards && heroCards.length > 0 && (
                          <div className="flex gap-2 mt-4">
                            {heroCards.map((card, i) => (
                              <div
                                key={i}
                                className="w-16 h-24 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center shadow-xl"
                              >
                                <span
                                  className={`text-3xl font-bold ${getCardColor(
                                    card
                                  )}`}
                                >
                                  {card}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Always visible at bottom */}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-full max-w-xl
                          bottom-[20px] z-50
                          bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-sm 
                          rounded-xl p-6 border border-white/10" // ---CHANGE
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {isHeroTurn ? "Your Turn" : "Waiting..."}
                  </h3>

                  {/* Real-time Analysis */}
                  {isHeroTurn && (
                    <div className="flex items-center gap-6 text-sm">
                      {potOdds !== null && (
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-400">Pot Odds:</span>
                          <span className="font-semibold text-blue-400">
                            {potOdds.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {equity !== null && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400">Equity:</span>
                          <span className="font-semibold text-green-400">
                            {equity.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {mdf !== null && (
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400">MDF:</span>
                          <span className="font-semibold text-yellow-400">
                            {mdf.toFixed(1)}%
                          </span>
                        </div>
                      )}
                      {ev !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">EV:</span>
                          <span
                            className={`font-semibold ${
                              ev >= 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {ev >= 0 ? "+" : ""}
                            {ev.toFixed(2)} BB
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {game && isHeroTurn ? (
                  <div className="space-y-4">
                    <div className="flex gap-3 justify-center">
                      {/* Always show these 4 buttons like GTO Wizard */}
                      {game.getLegalActions("hero").includes("fold") && (
                        <button
                          onClick={() => handleAction("fold")}
                          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-all"
                        >
                          FOLD
                        </button>
                      )}

                      {game.getLegalActions("hero").includes("check") && (
                        <button
                          onClick={() => handleAction("check")}
                          className="px-10 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-lg transition-all"
                        >
                          CHECK
                        </button>
                      )}

                      {game.getLegalActions("hero").includes("call") && (
                        <button
                          onClick={() => handleAction("call")}
                          className="px-10 py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-lg transition-all"
                        >
                          CALL
                        </button>
                      )}

                      {(game.getLegalActions("hero").includes("bet") ||
                        game.getLegalActions("hero").includes("raise")) && (
                        <button
                          onClick={() => {
                            const isRaise = game
                              .getLegalActions("hero")
                              .includes("raise");
                            handleAction(isRaise ? "raise" : "bet", betAmount);
                          }}
                          className="px-10 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition-all"
                        >
                          RAISE {Math.round(betAmount)}
                        </button>
                      )}

                      <button
                        onClick={() => handleAction("all-in")}
                        className="px-10 py-4 bg-red-800 hover:bg-red-900 rounded-lg font-bold text-lg transition-all"
                      >
                        ALL IN{" "}
                        {Math.round(
                          game.getState().players.find((p) => p.isHero)
                            ?.stack || 0
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    {!gameStarted ? (
                      <p className="text-gray-400">
                        Click "Start Playing" to begin
                      </p>
                    ) : (
                      <p className="text-gray-400">
                        Waiting for other players...
                      </p>
                    )}
                  </div>
                )}

                {/* GTO Feedback with EV Breakdown */}
                {showFeedback && lastFeedback && (
                  <div
                    className={`mt-4 p-4 rounded-lg border ${
                      lastFeedback.isGTO
                        ? "bg-green-900/20 border-green-600/50"
                        : "bg-yellow-900/20 border-yellow-600/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain
                          className={`w-5 h-5 ${
                            lastFeedback.isGTO
                              ? "text-green-500"
                              : "text-yellow-500"
                          }`}
                        />
                        <span className="font-semibold">
                          {lastFeedback.isGTO
                            ? "GTO Play!"
                            : "Suboptimal Decision"}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="hover:bg-white/10 rounded p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      {lastFeedback.explanation}
                    </p>

                    {/* EV Breakdown Table */}
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-xs font-semibold mb-2 text-gray-400">
                        Expected Value Breakdown:
                      </div>
                      <div className="space-y-1">
                        {lastFeedback.evBreakdown?.map((item, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between py-1 px-2 rounded ${
                              item.action === lastFeedback.action
                                ? "bg-white/10"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-sm font-semibold capitalize ${
                                  item.isOptimal
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }`}
                              >
                                {item.action}
                              </span>
                              {item.isOptimal && (
                                <span className="text-xs bg-green-600/30 text-green-400 px-2 py-0.5 rounded">
                                  HIGHEST EV
                                </span>
                              )}
                              {item.action === lastFeedback.action && (
                                <span className="text-xs bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded">
                                  YOUR CHOICE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span
                                className="text-xs text-gray-500"
                                title="How often GTO plays this action"
                              >
                                Freq: {item.gtoFrequency}%
                              </span>
                              <span
                                className={`text-sm font-mono ${
                                  item.ev > 0
                                    ? "text-green-400"
                                    : item.ev < 0
                                    ? "text-red-400"
                                    : "text-gray-400"
                                }`}
                              >
                                {item.ev >= 0 ? "+" : ""}
                                {item.ev.toFixed(2)} BB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Note:</strong> "Highest EV" = best single
                        action. "Freq" = how often GTO mixes this action.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hand History */}
              {handHistory.length > 0 && (
                <div className="mt-4 p-4 bg-black/50 rounded-lg border border-white/10">
                  <h4 className="text-sm font-semibold mb-2 text-gray-400">
                    Action History
                  </h4>
                  <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                    {handHistory.map((action, i) => (
                      <div key={i} className="text-gray-500">
                        {action}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
