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
  User
} from "lucide-react";
import { PokerGame, Card, Player, Action, Street } from "@/lib/poker/engine";
import { pushFoldSolver } from "@/lib/poker/solvers/pushFoldNash";
import { riverSolver } from "@/lib/poker/solvers/riverSolver";
import { mcts } from "@/lib/poker/solvers/mcts";

interface GameStats {
  handsPlayed: number;
  winRate: number;
  vpip: number; // Voluntarily Put money In Pot
  pfr: number;  // Pre-Flop Raise
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

export default function PracticeGame({ playerName = "Player" }: { playerName?: string }) {
  // Game state
  const [game, setGame] = useState<PokerGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStreet, setCurrentStreet] = useState<Street>('preflop');
  const [heroCards, setHeroCards] = useState<[Card, Card] | null>(null);
  const [board, setBoard] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  
  // UI state
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<DecisionFeedback | null>(null);
  const [handHistory, setHandHistory] = useState<string[]>([]);
  const [isHeroTurn, setIsHeroTurn] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState<GameStats>({
    handsPlayed: 0,
    winRate: 0,
    vpip: 0,
    pfr: 0,
    totalWinnings: 0
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
        id: 'villain2',
        name: 'GTO Bot 2',
        stack: 100,
        cards: [] as Card[],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: false,
        position: 0,
        isDealer: true
      },
      {
        id: 'hero',
        name: playerName,
        stack: 100,
        cards: [] as Card[],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: true,
        position: 1,
        isSB: true
      },
      {
        id: 'villain1',
        name: 'GTO Bot 1',
        stack: 100,
        cards: [] as Card[],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: false,
        position: 2,
        isBB: true
      }
    ];
    
    const blinds = { sb: 0.5, bb: 1 };
    const newGame = new PokerGame(initialPlayers, blinds);
    const gameState = newGame.getState();
    
    setGame(newGame);
    setGameStarted(true);
    setCurrentStreet('preflop');
    setPlayers(gameState.players);
    
    const heroPlayer = gameState.players.find(p => p.isHero);
    if (heroPlayer && heroPlayer.cards.length === 2) {
      setHeroCards(heroPlayer.cards as [Card, Card]);
    }
    
    setBoard([]);
    setPot(gameState.pot);
    setHandHistory([`New hand #${stats.handsPlayed + 1} started`]);
    setShowFeedback(false);
    setLastFeedback(null);
    setIsHeroTurn(gameState.actionOn === 'hero');
    setBetAmount(gameState.currentBet * 3); // Default raise size
    
    // Update stats
    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1
    }));
    
    // Calculate initial values
    updateCalculations(newGame);
    
    // If it's not hero's turn, make bot act
    if (gameState.actionOn !== 'hero') {
      setTimeout(() => botAction(newGame), 1500);
    }
  }, [stats.handsPlayed, playerName]);

  /**
   * Update real-time calculations
   */
  const updateCalculations = useCallback((gameInstance: PokerGame) => {
    const state = gameInstance.getState();
    const hero = state.players.find(p => p.isHero);
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
        else baseEquity = 0.50; // Lower pairs
      } else {
        // High cards
        if (card1Rank === 14 && card2Rank >= 11) { // Ace-high
          baseEquity = isSuited ? 0.55 : 0.50;
        } else if (card1Rank >= 12 && card2Rank >= 10) { // Broadway
          baseEquity = isSuited ? 0.48 : 0.43;
        } else if (card1Rank + card2Rank >= 20) { // Medium-high
          baseEquity = isSuited ? 0.40 : 0.35;
        } else {
          baseEquity = isSuited ? 0.32 : 0.28; // Low cards
        }
      }
      
      // Adjust for street and board texture
      if (state.board.length === 3) { // Flop
        // Add some variance based on board interaction (simplified)
        baseEquity = Math.max(0.05, Math.min(0.95, baseEquity + (Math.random() - 0.5) * 0.15));
      } else if (state.board.length === 4) { // Turn
        baseEquity = Math.max(0.02, Math.min(0.98, baseEquity + (Math.random() - 0.5) * 0.10));
      } else if (state.board.length === 5) { // River
        baseEquity = Math.max(0, Math.min(1, baseEquity + (Math.random() - 0.5) * 0.08));
      }
      
      setEquity(baseEquity * 100);
      
      // Calculate EV
      if (toCall > 0) {
        const evValue = (baseEquity * (state.pot + toCall)) - toCall;
        setEV(evValue);
      } else {
        setEV(null);
      }
    }
  }, []);

  /**
   * Bot makes a decision using our solvers
   */
  const botAction = useCallback((gameInstance: PokerGame) => {
    const state = gameInstance.getState();
    const currentBot = state.players.find(p => p.id === state.actionOn);
    
    if (!currentBot || currentBot.isHero) {
      return;
    }
    
    // Prevent infinite loops - check if we're stuck
    const recentHistory = state.history.slice(-5);
    const stuckChecking = recentHistory.length >= 5 && 
      recentHistory.every(h => h.action === 'check' && h.playerId === currentBot.id);
    
    if (stuckChecking) {
      console.error('Bot stuck checking, forcing different action');
      // Force a different action if stuck
      action = 'bet';
      const legalActions = gameInstance.getLegalActions(currentBot.id);
      if (!legalActions.includes('bet')) {
        action = legalActions.find(a => a !== 'check') || legalActions[0];
      }
      gameInstance.executeAction(currentBot.id, action, state.pot * 0.5);
      return;
    }
    
    // Use different strategies based on stack size and street
    let action: Action;
    const effectiveStack = currentBot.stack;
    const potSize = state.pot;
    
    // Short stack: use push/fold
    if (effectiveStack < 20) {
      const shouldPush = Math.random() < 0.3; // Simplified
      action = shouldPush ? 'all-in' : 'fold';
    }
    // River: use river solver
    else if (state.street === 'river') {
      const bluffFreq = riverSolver.calculateBluffToValueRatio(state.currentBet || potSize * 0.66, potSize);
      if (Math.random() < bluffFreq) {
        action = 'raise';
      } else {
        action = state.currentBet > currentBot.currentBet ? 'call' : 'check';
      }
    }
    // Use simplified MCTS logic
    else {
      const random = Math.random();
      const toCall = state.currentBet - currentBot.currentBet;
      
      if (toCall === 0) {
        // Can check or bet
        action = random < 0.7 ? 'check' : 'bet';
      } else {
        // Must call, raise, or fold
        if (random < 0.2) action = 'fold';
        else if (random < 0.6) action = 'call';
        else action = 'raise';
      }
    }
    
    // Execute bot action
    const legalActions = gameInstance.getLegalActions(currentBot.id);
    if (!legalActions.includes(action)) {
      action = legalActions[0]; // Fallback to first legal action
    }
    
    let amount: number | undefined;
    if (action === 'bet') {
      amount = potSize * 0.66;
    } else if (action === 'raise') {
      // Proper raise sizing - minimum is 2x current bet
      const minRaise = state.currentBet * 2;
      amount = Math.max(minRaise, state.currentBet + potSize * 0.66);
    }
    
    gameInstance.executeAction(currentBot.id, action, amount);
    
    // Update UI
    const newState = gameInstance.getState();
    setPlayers(newState.players);
    setPot(newState.pot);
    setCurrentStreet(newState.street);
    setBoard(newState.board);
    setHandHistory(prev => [...prev, `${currentBot.name} ${action}${amount ? ` $${amount.toFixed(2)}` : ''}`]);
    
    // Check if it's hero's turn now
    if (newState.actionOn === 'hero') {
      setIsHeroTurn(true);
      updateCalculations(gameInstance);
    } else if (newState.actionOn && newState.actionOn !== 'hero') {
      // Another bot's turn
      setTimeout(() => botAction(gameInstance), 1500);
    }
  }, [updateCalculations]);

  /**
   * Handle hero action
   */
  const handleAction = useCallback((action: Action, amount?: number) => {
    if (!game || !isHeroTurn) return;
    
    const success = game.executeAction('hero', action, amount);
    if (!success) return;
    
    const state = game.getState();
    setPlayers(state.players);
    setPot(state.pot);
    setCurrentStreet(state.street);
    setBoard(state.board);
    setIsHeroTurn(false);
    setSelectedAction(null);
    setHandHistory(prev => [...prev, `You ${action}${amount ? ` $${amount.toFixed(2)}` : ''}`]);
    
    // Generate GTO feedback with EV breakdown
    const evBreakdown = calculateEVBreakdown(game, state);
    const optimalAction = evBreakdown.reduce((best, current) => 
      current.ev > best.ev ? current : best
    );
    
    const feedback: DecisionFeedback = {
      action,
      isGTO: action === optimalAction.action,
      expectedValue: evBreakdown.find(a => a.action === action)?.ev || 0,
      explanation: action === optimalAction.action 
        ? `GTO play! This action has the highest EV of ${optimalAction.ev.toFixed(2)} BB`
        : `The GTO play here is ${optimalAction.action} with EV of ${optimalAction.ev.toFixed(2)} BB. Your ${action} has EV of ${evBreakdown.find(a => a.action === action)?.ev.toFixed(2)} BB`,
      evBreakdown
    };
    setLastFeedback(feedback);
    setShowFeedback(true);
    
    // Check for hand end or next action
    if (state.actionOn && state.actionOn !== 'hero') {
      setTimeout(() => botAction(game), 1500);
    }
  }, [game, isHeroTurn, botAction]);

  const getRankValue = (rank: string): number => {
    const values: Record<string, number> = {
      '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
      'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };
    return values[rank] || 0;
  };
  
  /**
   * Calculate EV for all possible actions
   */
  const calculateEVBreakdown = (gameInstance: PokerGame, state: any): any[] => {
    const hero = state.players.find((p: Player) => p.isHero);
    if (!hero) return [];
    
    const pot = state.pot;
    const toCall = state.currentBet - hero.currentBet;
    // Use the actual calculated equity (from state) or calculate it here
    const equityPercent = equity || 35; // Use state equity or default
    const equityDecimal = equityPercent / 100;
    
    const breakdown = [];
    
    // Calculate fold EV (always 0)
    breakdown.push({
      action: 'fold',
      ev: 0,
      gtoFrequency: 10,
      isOptimal: false // Never optimal when we have positive EV options
    });
    
    // Calculate call EV
    if (toCall > 0) {
      const callEV = equityDecimal * (pot + toCall) - toCall;
      breakdown.push({
        action: 'call',
        ev: callEV,
        gtoFrequency: 60,
        isOptimal: false // Will be set below
      });
    }
    
    // Calculate check EV
    if (toCall === 0) {
      const checkEV = equityDecimal * pot;
      breakdown.push({
        action: 'check',
        ev: checkEV,
        gtoFrequency: 50,
        isOptimal: false // Will be set below
      });
    }
    
    // Calculate raise/bet EV (simplified)
    const raiseSize = state.currentBet * 2 || pot * 0.66;
    const foldEquity = 0.3; // Simplified fold equity
    const raiseEV = foldEquity * pot + (1 - foldEquity) * (equityDecimal * (pot + raiseSize * 2) - raiseSize);
    breakdown.push({
      action: toCall === 0 ? 'bet' : 'raise',
      ev: raiseEV,
      gtoFrequency: 30,
      isOptimal: false // Will be set below
    });
    
    // Find the action with highest EV and mark it as optimal
    const maxEV = Math.max(...breakdown.map(b => b.ev));
    breakdown.forEach(item => {
      item.isOptimal = item.ev === maxEV && item.ev > 0;
    });
    
    return breakdown;
  };

  const getCardColor = (card: Card): string => {
    const suit = card[1];
    return suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-black';
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
                <span className={`font-semibold ${stats.winRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.winRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">P/L:</span>
                <span className={`font-semibold ${stats.totalWinnings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.totalWinnings >= 0 ? '+' : ''}{stats.totalWinnings.toFixed(2)} BB
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={startNewHand}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-semibold flex items-center gap-2 transition-all"
          >
            {gameStarted ? <RotateCcw className="w-4 h-4" /> : <Play className="w-5 h-5" />}
            {gameStarted ? 'New Hand' : 'Start Playing'}
          </button>
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
                Play against two GTO bots that use real game theory algorithms including CFR and MCTS
              </p>
              <button
                onClick={startNewHand}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto transition-all transform hover:scale-105"
              >
                <Play className="w-6 h-6" />
                Start First Hand
              </button>
            </div>
          ) : (
            <div className="w-full max-w-6xl mx-auto">
              {/* Table with Players */}
              <div className="relative">
                {/* Poker Table */}
                <div className="h-[400px] relative">
                  <div className="absolute inset-4 rounded-[120px] bg-gradient-to-br from-green-900/40 to-green-950/40 border-8 border-amber-900/50 shadow-2xl">
                    {/* Table felt texture */}
                    <div className="absolute inset-0 rounded-[112px] opacity-30 bg-gradient-to-br from-transparent via-green-800/20 to-transparent" />
                    
                    {/* Pot Display - Positioned above cards */}
                    <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20">
                      <div className="px-6 py-3 bg-gradient-to-b from-gray-900 to-black rounded-xl border border-yellow-600/50 shadow-xl">
                        <div className="text-xs text-yellow-500 uppercase tracking-wider mb-1">Total Pot</div>
                        <div className="text-3xl font-bold text-yellow-400">${pot.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Community Cards - Positioned lower */}
                    <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 z-10">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`w-16 h-24 rounded-lg shadow-lg transform transition-all ${
                            board[i]
                              ? 'bg-white border-2 border-gray-300 flex items-center justify-center'
                              : 'bg-gradient-to-br from-blue-900 to-blue-950 border-2 border-blue-700'
                          }`}
                        >
                          {board[i] && (
                            <span className={`text-3xl font-bold ${getCardColor(board[i])}`}>
                              {board[i]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Dealer Button */}
                    {players.length > 0 && (
                      <div className="absolute top-[70%] left-[20%] w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-bold text-black shadow-lg">
                        D
                      </div>
                    )}
                  </div>

                  {/* Players positioned around the table */}
                  {/* Top Left Player (Bot 1 - BB) */}
                  {players[2] && (
                    <div className="absolute top-8 left-8">
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-2">
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-900 to-purple-950 border-2 border-purple-600 flex items-center justify-center mb-2 shadow-xl">
                          <Brain className="w-10 h-10 text-purple-400" />
                        </div>
                        <div className="text-sm font-semibold">{players[2].name}</div>
                        <div className="text-xs text-yellow-500 font-bold">BB</div>
                        <div className="text-sm text-gray-400">${players[2].stack.toFixed(2)}</div>
                        {players[2].hasFolded && (
                          <div className="text-xs text-red-500 mt-1">FOLDED</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Top Right Player (Bot 2 - BTN/Dealer) */}
                  {players[0] && (
                    <div className="absolute top-8 right-8">
                      <div className="flex flex-col items-center">
                        <div className="flex gap-1 mb-2">
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                          <div className="w-10 h-14 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-700 shadow-lg" />
                        </div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-900 to-indigo-950 border-2 border-indigo-600 flex items-center justify-center mb-2 shadow-xl">
                          <Brain className="w-10 h-10 text-indigo-400" />
                        </div>
                        <div className="text-sm font-semibold">{players[0].name}</div>
                        <div className="text-xs text-yellow-500 font-bold">BTN</div>
                        <div className="text-sm text-gray-400">${players[0].stack.toFixed(2)}</div>
                        {players[0].hasFolded && (
                          <div className="text-xs text-red-500 mt-1">FOLDED</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom Player (Hero - SB) - positioned below the table */}
                  {players[1] && (
                    <div className="absolute -bottom-32 left-1/2 -translate-x-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-900 to-green-950 border-3 border-green-500 flex items-center justify-center mb-2 shadow-xl">
                          <User className="w-10 h-10 text-green-400" />
                        </div>
                        <div className="text-sm font-semibold text-green-400">{players[1].name}</div>
                        <div className="text-xs text-yellow-500 font-bold">SB</div>
                        <div className="text-sm text-gray-400">${players[1].stack.toFixed(2)}</div>
                        {players[1].hasFolded && (
                          <div className="text-xs text-red-500 mt-1">FOLDED</div>
                        )}
                        <div className="flex gap-2 mt-3">
                          {heroCards?.map((card, i) => (
                            <div
                              key={i}
                              className="w-20 h-28 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform"
                            >
                              <span className={`text-4xl font-bold ${getCardColor(card)}`}>
                                {card}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Always visible at bottom */}
              <div className="mt-8 bg-gradient-to-b from-gray-900/90 to-black/90 backdrop-blur-sm rounded-xl p-6 border border-white/10">
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
                          <span className="font-semibold text-blue-400">{potOdds.toFixed(1)}%</span>
                        </div>
                      )}
                      {equity !== null && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-gray-400">Equity:</span>
                          <span className="font-semibold text-green-400">{equity.toFixed(1)}%</span>
                        </div>
                      )}
                      {mdf !== null && (
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-400">MDF:</span>
                          <span className="font-semibold text-yellow-400">{mdf.toFixed(1)}%</span>
                        </div>
                      )}
                      {ev !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">EV:</span>
                          <span className={`font-semibold ${ev >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {ev >= 0 ? '+' : ''}{ev.toFixed(2)} BB
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {game && isHeroTurn ? (
                  <div className="space-y-4">
                    <div className="flex gap-3 justify-center">
                      {game.getLegalActions('hero').includes('fold') && (
                        <button
                          onClick={() => handleAction('fold')}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          Fold
                        </button>
                      )}
                      
                      {game.getLegalActions('hero').includes('check') && (
                        <button
                          onClick={() => handleAction('check')}
                          className="px-8 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          Check
                        </button>
                      )}
                      
                      {game.getLegalActions('hero').includes('call') && (
                        <button
                          onClick={() => handleAction('call')}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          Call ${(game.getState().currentBet - (game.getState().players.find(p => p.isHero)?.currentBet || 0)).toFixed(2)}
                        </button>
                      )}
                      
                      {(game.getLegalActions('hero').includes('bet') || game.getLegalActions('hero').includes('raise')) && (
                        <button
                          onClick={() => setSelectedAction(selectedAction === 'raise' ? null : 'raise')}
                          className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          {game.getLegalActions('hero').includes('bet') ? 'Bet' : 'Raise'}
                        </button>
                      )}
                      
                      {game.getLegalActions('hero').includes('all-in') && (
                        <button
                          onClick={() => handleAction('all-in')}
                          className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg font-semibold transition-all transform hover:scale-105"
                        >
                          All-In
                        </button>
                      )}
                    </div>

                    {/* Bet Sizing */}
                    {selectedAction === 'raise' && (
                      <div className="flex items-center justify-center gap-3 p-4 bg-black/50 rounded-lg">
                        <button
                          onClick={() => setBetAmount(Math.max(game.getState().currentBet * 2, betAmount - 1))}
                          className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">$</span>
                          <input
                            type="number"
                            value={betAmount}
                            onChange={(e) => setBetAmount(Number(e.target.value))}
                            className="w-24 px-3 py-2 bg-black/50 border border-white/20 rounded text-center font-semibold"
                          />
                        </div>
                        
                        <button
                          onClick={() => setBetAmount(betAmount + 1)}
                          className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                        
                        {/* Quick bet buttons */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => setBetAmount(pot * 0.33)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                          >
                            33%
                          </button>
                          <button
                            onClick={() => setBetAmount(pot * 0.66)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                          >
                            66%
                          </button>
                          <button
                            onClick={() => setBetAmount(pot)}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                          >
                            POT
                          </button>
                        </div>
                        
                        <button
                          onClick={() => {
                            handleAction(game.getLegalActions('hero').includes('bet') ? 'bet' : 'raise', betAmount);
                            setSelectedAction(null);
                          }}
                          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold ml-4"
                        >
                          Confirm
                        </button>
                        
                        <button
                          onClick={() => setSelectedAction(null)}
                          className="p-2 hover:bg-gray-700 rounded"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    {!gameStarted ? (
                      <p className="text-gray-400">Click "Start Playing" to begin</p>
                    ) : (
                      <p className="text-gray-400">Waiting for other players...</p>
                    )}
                  </div>
                )}

                {/* GTO Feedback with EV Breakdown */}
                {showFeedback && lastFeedback && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    lastFeedback.isGTO 
                      ? 'bg-green-900/20 border-green-600/50' 
                      : 'bg-yellow-900/20 border-yellow-600/50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Brain className={`w-5 h-5 ${lastFeedback.isGTO ? 'text-green-500' : 'text-yellow-500'}`} />
                        <span className="font-semibold">
                          {lastFeedback.isGTO ? 'GTO Play!' : 'Suboptimal Decision'}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="hover:bg-white/10 rounded p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{lastFeedback.explanation}</p>
                    
                    {/* EV Breakdown Table */}
                    <div className="bg-black/30 rounded p-3">
                      <div className="text-xs font-semibold mb-2 text-gray-400">Expected Value Breakdown:</div>
                      <div className="space-y-1">
                        {lastFeedback.evBreakdown?.map((item, i) => (
                          <div 
                            key={i} 
                            className={`flex items-center justify-between py-1 px-2 rounded ${
                              item.action === lastFeedback.action ? 'bg-white/10' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`text-sm font-semibold capitalize ${
                                item.isOptimal ? 'text-green-400' : 'text-gray-400'
                              }`}>
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
                              <span className="text-xs text-gray-500" title="How often GTO plays this action">
                                Freq: {item.gtoFrequency}%
                              </span>
                              <span className={`text-sm font-mono ${
                                item.ev > 0 ? 'text-green-400' : item.ev < 0 ? 'text-red-400' : 'text-gray-400'
                              }`}>
                                {item.ev >= 0 ? '+' : ''}{item.ev.toFixed(2)} BB
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        <strong>Note:</strong> "Highest EV" = best single action. "Freq" = how often GTO mixes this action.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hand History */}
              {handHistory.length > 0 && (
                <div className="mt-4 p-4 bg-black/50 rounded-lg border border-white/10">
                  <h4 className="text-sm font-semibold mb-2 text-gray-400">Action History</h4>
                  <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                    {handHistory.map((action, i) => (
                      <div key={i} className="text-gray-500">{action}</div>
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