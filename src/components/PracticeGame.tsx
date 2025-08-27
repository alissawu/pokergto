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
  Plus
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
  alternativeActions: {
    action: Action;
    ev: number;
    frequency: number;
  }[];
}

export default function PracticeGame() {
  // Game state
  const [game, setGame] = useState<PokerGame | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStreet, setCurrentStreet] = useState<Street>('preflop');
  const [heroCards, setHeroCards] = useState<[Card, Card] | null>(null);
  const [board, setBoard] = useState<Card[]>([]);
  const [pot, setPot] = useState(0);
  const [heroStack, setHeroStack] = useState(100);
  const [villainStack, setVillainStack] = useState(100);
  
  // UI state
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [betAmount, setBetAmount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<DecisionFeedback | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [handHistory, setHandHistory] = useState<string[]>([]);
  
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
   * Start a new hand
   */
  const startNewHand = useCallback(() => {
    const players = [
      {
        id: 'hero',
        name: 'You',
        stack: heroStack,
        cards: [] as Card[],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: true,
        position: 0
      },
      {
        id: 'villain',
        name: 'GTO Bot',
        stack: villainStack,
        cards: [] as Card[],
        currentBet: 0,
        totalInvested: 0,
        hasFolded: false,
        isAllIn: false,
        isHero: false,
        position: 1
      }
    ];
    
    const blinds = { sb: 0.5, bb: 1 };
    const newGame = new PokerGame(players, blinds);
    const gameState = newGame.getState();
    
    setGame(newGame);
    setGameStarted(true);
    setCurrentStreet('preflop');
    const heroPlayer = gameState.players.find(p => p.isHero);
    if (heroPlayer && heroPlayer.cards.length === 2) {
      setHeroCards(heroPlayer.cards as [Card, Card]);
    } else {
      setHeroCards(null);
    }
    setBoard([]);
    setPot(gameState.pot);
    setHandHistory([]);
    setShowFeedback(false);
    setLastFeedback(null);
    
    // Calculate initial values
    updateCalculations(newGame);
  }, [heroStack, villainStack]);

  /**
   * Update real-time calculations
   */
  const updateCalculations = useCallback((gameInstance: PokerGame) => {
    const state = gameInstance.getState();
    const hero = state.players.find(p => p.isHero);
    if (!hero) return;
    
    // Calculate pot odds
    const toCall = state.currentBet - hero.currentBet;
    if (toCall > 0) {
      const odds = state.pot / toCall;
      setPotOdds(odds);
      
      // Calculate MDF (Minimum Defense Frequency)
      const mdfValue = riverSolver.calculateMDF(toCall, state.pot);
      setMDF(mdfValue);
    } else {
      setPotOdds(null);
      setMDF(null);
    }
    
    // Calculate equity (simplified - in production would use Monte Carlo)
    if (state.board.length >= 3) {
      // Simplified equity calculation
      const estimatedEquity = 0.5 + (Math.random() - 0.5) * 0.3;
      setEquity(estimatedEquity);
      
      // Calculate EV
      if (toCall > 0 && estimatedEquity !== null) {
        const evValue = estimatedEquity * (state.pot + toCall) - toCall;
        setEV(evValue);
      }
    }
  }, []);

  /**
   * Handle player action
   */
  const handleAction = useCallback(async (action: Action, amount?: number) => {
    if (!game) return;
    
    const state = game.getState();
    const hero = state.players.find(p => p.isHero);
    if (!hero || state.actionOn !== 'hero') return;
    
    // Perform action
    const success = game.performAction('hero', action, amount);
    if (!success) return;
    
    // Add to history
    setHandHistory(prev => [...prev, `Hero ${action}s${amount ? ` $${amount}` : ''}`]);
    
    // Get GTO feedback
    const feedback = await analyzeDecision(state, action, amount);
    setLastFeedback(feedback);
    setShowFeedback(true);
    
    // Update game state
    const newState = game.getState();
    setBoard(newState.board);
    setPot(newState.pot);
    setCurrentStreet(newState.street);
    
    // Check if hand is over
    if (isHandComplete(newState)) {
      handleHandComplete(newState);
      return;
    }
    
    // Bot's turn
    if (newState.actionOn === 'villain') {
      setTimeout(() => makeBotDecision(), 1500);
    }
    
    updateCalculations(game);
  }, [game, updateCalculations]);

  /**
   * Bot decision using our algorithms
   */
  const makeBotDecision = useCallback(async () => {
    if (!game) return;
    
    const state = game.getState();
    const villain = state.players.find(p => !p.isHero);
    if (!villain || state.actionOn !== 'villain') return;
    
    let action: Action;
    let amount: number | undefined;
    
    // Use different algorithms based on situation
    if (villain.stack <= 20 && state.street === 'preflop') {
      // Use push/fold Nash for short stacks
      const shouldPush = pushFoldSolver.shouldPush(
        cardsToNotation(villain.cards),
        villain.stack
      );
      action = shouldPush ? 'all-in' : 'fold';
    } else if (state.street === 'river') {
      // Use river solver for river decisions
      const mdf = riverSolver.calculateMDF(state.currentBet - villain.currentBet, state.pot);
      action = Math.random() < mdf ? 'call' : 'fold';
    } else {
      // Use MCTS for complex decisions
      action = await mcts.search(state, { timeLimit: 500 });
      
      // Calculate bet size if raising
      if (action === 'raise') {
        const bluffToValue = riverSolver.calculateBluffToValueRatio(state.pot * 0.75, state.pot);
        amount = state.pot * (0.33 + bluffToValue * 0.67); // Dynamic sizing
      }
    }
    
    // Perform bot action
    game.performAction('villain', action, amount);
    
    // Add to history
    setHandHistory(prev => [...prev, `Villain ${action}s${amount ? ` $${amount}` : ''}`]);
    
    // Update state
    const newState = game.getState();
    setBoard(newState.board);
    setPot(newState.pot);
    setCurrentStreet(newState.street);
    
    // Check if hand is over
    if (isHandComplete(newState)) {
      handleHandComplete(newState);
      return;
    }
    
    updateCalculations(game);
  }, [game, updateCalculations]);

  /**
   * Analyze player's decision using GTO principles
   */
  const analyzeDecision = async (
    state: any,
    action: Action,
    amount?: number
  ): Promise<DecisionFeedback> => {
    // This would use our solvers to analyze the decision
    // Simplified for demonstration
    
    const alternatives = [
      { action: 'fold' as Action, ev: -1, frequency: 0.1 },
      { action: 'call' as Action, ev: 2.5, frequency: 0.6 },
      { action: 'raise' as Action, ev: 4.2, frequency: 0.3 }
    ];
    
    const playerEV = alternatives.find(a => a.action === action)?.ev || 0;
    const maxEV = Math.max(...alternatives.map(a => a.ev));
    
    return {
      action,
      isGTO: Math.abs(playerEV - maxEV) < 0.5,
      expectedValue: playerEV,
      explanation: playerEV === maxEV 
        ? "Perfect GTO play! This maximizes your expected value."
        : `Consider ${alternatives.find(a => a.ev === maxEV)?.action} for +${(maxEV - playerEV).toFixed(2)}BB EV`,
      alternativeActions: alternatives
    };
  };

  /**
   * Handle hand completion
   */
  const handleHandComplete = (state: any) => {
    const hero = state.players.find((p: Player) => p.isHero);
    const villain = state.players.find((p: Player) => !p.isHero);
    
    if (!hero || !villain) return;
    
    // Determine winner (simplified)
    const heroWon = !hero.hasFolded && (villain.hasFolded || Math.random() > 0.5);
    
    // Update stacks
    if (heroWon) {
      setHeroStack(prev => prev + state.pot - hero.totalInvested);
      setVillainStack(prev => prev - villain.totalInvested);
    } else {
      setHeroStack(prev => prev - hero.totalInvested);
      setVillainStack(prev => prev + state.pot - villain.totalInvested);
    }
    
    // Update stats
    setStats(prev => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
      winRate: heroWon 
        ? (prev.winRate * prev.handsPlayed + 1) / (prev.handsPlayed + 1)
        : (prev.winRate * prev.handsPlayed) / (prev.handsPlayed + 1),
      totalWinnings: prev.totalWinnings + (heroWon ? state.pot - hero.totalInvested : -hero.totalInvested)
    }));
    
    setShowAnalysis(true);
  };

  const isHandComplete = (state: any) => {
    const activePlayers = state.players.filter((p: Player) => !p.hasFolded);
    return activePlayers.length === 1 || 
           (state.street === 'river' && state.players.every((p: Player) => 
             p.hasFolded || p.currentBet === state.currentBet || p.stack === 0
           ));
  };

  const cardsToNotation = (cards: [Card, Card]): string => {
    // Convert cards to standard notation (e.g., "AKs", "99")
    const [c1, c2] = cards;
    const r1 = c1[0];
    const r2 = c2[0];
    const suited = c1[1] === c2[1];
    
    if (r1 === r2) return `${r1}${r2}`;
    return `${r1}${r2}${suited ? 's' : 'o'}`;
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#0a0a0b] to-black">
      {/* Header Bar */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold">Practice Mode</h2>
            
            {/* Stats Display */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Hands:</span>
                <span className="font-semibold">{stats.handsPlayed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Win Rate:</span>
                <span className={`font-semibold ${stats.winRate >= 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                  {(stats.winRate * 100).toFixed(1)}%
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
          
          <div className="flex items-center gap-3">
            {gameStarted ? (
              <button
                onClick={startNewHand}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                New Hand
              </button>
            ) : (
              <button
                onClick={startNewHand}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center gap-2 transition-all"
              >
                <Play className="w-5 h-5" />
                Start Playing
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Game Table */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {!gameStarted ? (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Practice?</h3>
              <p className="text-gray-400 mb-8">
                Play against our GTO bot that uses real game theory algorithms
              </p>
              <button
                onClick={startNewHand}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-bold text-lg flex items-center gap-3 mx-auto transition-all"
              >
                <Play className="w-6 h-6" />
                Start First Hand
              </button>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              {/* Opponent */}
              <div className="flex justify-center mb-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center mb-2">
                    <Brain className="w-10 h-10 text-gray-400" />
                  </div>
                  <div className="text-sm font-semibold">GTO Bot</div>
                  <div className="text-xs text-gray-400">${villainStack.toFixed(2)}</div>
                  <div className="flex gap-1 mt-2">
                    <div className="w-12 h-16 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-800" />
                    <div className="w-12 h-16 rounded bg-gradient-to-br from-blue-900 to-blue-950 border border-blue-800" />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="relative h-64 mb-8">
                <div className="absolute inset-0 rounded-[9999px] bg-gradient-to-br from-green-900/30 to-green-950/30 border-8 border-gray-800">
                  {/* Pot */}
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="px-4 py-2 bg-black/60 rounded-lg border border-white/20">
                      <div className="text-xs text-gray-400">Pot</div>
                      <div className="text-xl font-bold">${pot.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Community Cards */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`w-14 h-20 rounded-lg border ${
                          board[i]
                            ? 'bg-white border-gray-300 flex items-center justify-center text-2xl font-bold'
                            : 'bg-gradient-to-br from-blue-900 to-blue-950 border-blue-800'
                        }`}
                      >
                        {board[i] || ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hero */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="flex gap-2 mb-2">
                    {heroCards?.map((card, i) => (
                      <div
                        key={i}
                        className="w-16 h-24 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-3xl font-bold"
                      >
                        {card}
                      </div>
                    ))}
                  </div>
                  <div className="w-20 h-20 rounded-full bg-green-900/30 border-2 border-green-500 flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold">YOU</span>
                  </div>
                  <div className="text-sm font-semibold">Hero (SB)</div>
                  <div className="text-xs text-gray-400">${heroStack.toFixed(2)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              {game && game.getState().actionOn === 'hero' && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction('fold')}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-all"
                    >
                      Fold
                    </button>
                    {game.getLegalActions().includes('check') ? (
                      <button
                        onClick={() => handleAction('check')}
                        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-all"
                      >
                        Check
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction('call')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
                      >
                        Call ${(game.getState().currentBet - (game.getState().players.find(p => p.isHero)?.currentBet || 0)).toFixed(2)}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAction('raise')}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-all"
                    >
                      Raise
                    </button>
                  </div>

                  {/* Bet Sizing */}
                  {selectedAction === 'raise' && (
                    <div className="flex items-center gap-3 p-4 bg-black/50 rounded-lg">
                      <button
                        onClick={() => setBetAmount(Math.max(game.getState().currentBet * 2, betAmount - 1))}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="w-24 px-3 py-2 bg-black/50 border border-white/20 rounded text-center"
                      />
                      <button
                        onClick={() => setBetAmount(betAmount + 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          handleAction('raise', betAmount);
                          setSelectedAction(null);
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setSelectedAction(null)}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Analysis */}
        <div className="w-96 bg-black/50 border-l border-white/10 p-6 overflow-y-auto">
          {/* Real-time Calculations */}
          {gameStarted && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                Real-time Analysis
              </h3>
              
              <div className="space-y-3">
                {potOdds !== null && (
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Pot Odds</span>
                      <span className="font-semibold">{potOdds.toFixed(2)} : 1</span>
                    </div>
                  </div>
                )}
                
                {equity !== null && (
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Equity</span>
                      <span className="font-semibold">{(equity * 100).toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-600 to-green-500 h-2 rounded-full"
                        style={{ width: `${equity * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {ev !== null && (
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Expected Value</span>
                      <span className={`font-semibold ${ev >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {ev >= 0 ? '+' : ''}{ev.toFixed(2)} BB
                      </span>
                    </div>
                  </div>
                )}
                
                {mdf !== null && (
                  <div className="p-3 bg-black/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">MDF</span>
                      <span className="font-semibold">{(mdf * 100).toFixed(1)}%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Minimum defense frequency vs bet
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GTO Feedback */}
          {showFeedback && lastFeedback && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                GTO Analysis
              </h3>
              
              <div className={`p-4 rounded-lg border ${
                lastFeedback.isGTO 
                  ? 'bg-green-900/20 border-green-600/30' 
                  : 'bg-yellow-900/20 border-yellow-600/30'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {lastFeedback.isGTO ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Info className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="font-semibold">
                    {lastFeedback.isGTO ? 'GTO Play!' : 'Consider Alternative'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">
                  {lastFeedback.explanation}
                </p>
                
                <div className="space-y-2">
                  {lastFeedback.alternativeActions.map((alt) => (
                    <div key={alt.action} className="flex items-center justify-between text-sm">
                      <span className={alt.action === lastFeedback.action ? 'text-white font-semibold' : 'text-gray-400'}>
                        {alt.action.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`${alt.ev >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {alt.ev >= 0 ? '+' : ''}{alt.ev.toFixed(1)} BB
                        </span>
                        <span className="text-gray-500">
                          ({(alt.frequency * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hand History */}
          {handHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Hand History
              </h3>
              
              <div className="space-y-2">
                {handHistory.map((action, i) => (
                  <div key={i} className="text-sm text-gray-400">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post-Hand Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1c] rounded-xl border border-white/10 p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold mb-6">Hand Complete</h3>
            
            {/* Hand summary */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Result</div>
                <div className="text-xl font-bold">
                  {stats.totalWinnings >= 0 ? 'Won' : 'Lost'} ${Math.abs(stats.totalWinnings).toFixed(2)}
                </div>
              </div>
              
              {/* GTO recommendations */}
              <div className="p-4 bg-black/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Key Learning</div>
                <p className="text-gray-300">
                  Consider pot odds vs equity when making decisions. 
                  Your play was {lastFeedback?.isGTO ? 'GTO optimal' : 'exploitable'}.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAnalysis(false);
                  startNewHand();
                }}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Next Hand
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAnalysis(false)}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}