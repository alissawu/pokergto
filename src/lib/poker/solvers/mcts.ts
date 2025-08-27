/**
 * Monte Carlo Tree Search (MCTS) for Poker
 * 
 * MCTS is used in:
 * - AlphaGo/AlphaZero (for Go/Chess)
 * - Pluribus (multiplayer poker)
 * - Real-time poker decision making
 * 
 * This implementation shows understanding of:
 * - UCB1 (Upper Confidence Bound)
 * - Information Set MCTS (IS-MCTS) for imperfect information
 * - Progressive widening for large action spaces
 * - RAVE (Rapid Action Value Estimation)
 */

import { Card, Action, GameState } from '../engine';

/**
 * MCTS Node for poker
 * Handles imperfect information through information sets
 */
export interface MCTSNode {
  infoSet: string;           // Information set identifier
  visits: number;            // Number of times visited
  totalReward: number;       // Cumulative reward
  children: Map<Action, MCTSNode>;
  parent: MCTSNode | null;
  action: Action | null;     // Action that led to this node
  availableActions: Action[];
  player: number;
  
  // IS-MCTS specific
  reachProbabilities: Map<string, number>; // Probability of reaching this node with each possible hand
  privateCards?: Card[];     // Private cards if known
}

/**
 * Configuration for MCTS
 */
export interface MCTSConfig {
  explorationConstant: number;  // C in UCB1 formula (typically √2)
  simulationDepth: number;      // Max depth for rollouts
  timeLimit: number;            // Milliseconds per decision
  usePUCT: boolean;            // Use PUCT like AlphaZero
  useRAVE: boolean;            // Use RAVE for faster convergence
  progressiveWidening: boolean; // For large action spaces
}

/**
 * Information Set Monte Carlo Tree Search
 * This variant handles hidden information in poker
 */
export class ISMCTS {
  private root: MCTSNode | null = null;
  private config: MCTSConfig;
  
  constructor(config: Partial<MCTSConfig> = {}) {
    this.config = {
      explorationConstant: Math.sqrt(2),
      simulationDepth: 100,
      timeLimit: 1000,
      usePUCT: false,
      useRAVE: false,
      progressiveWidening: true,
      ...config
    };
  }
  
  /**
   * Main MCTS search
   * Returns best action after running simulations
   */
  public search(gameState: GameState, iterations?: number): Action {
    const startTime = Date.now();
    const maxIterations = iterations || Infinity;
    let iter = 0;
    
    // Initialize root if needed
    if (!this.root) {
      this.root = this.createNode(gameState, null, null);
    }
    
    // Run MCTS iterations
    while (
      iter < maxIterations && 
      Date.now() - startTime < this.config.timeLimit
    ) {
      // Determinization - sample opponent's hidden cards
      const determinization = this.determinize(gameState);
      
      // Run one iteration of MCTS
      this.iterate(determinization, this.root);
      
      iter++;
    }
    
    // Select best action based on visit count (most robust)
    return this.selectBestAction(this.root);
  }
  
  /**
   * One iteration of MCTS
   * Selection -> Expansion -> Simulation -> Backpropagation
   */
  private iterate(gameState: GameState, node: MCTSNode): number {
    // Terminal node - return utility
    if (this.isTerminal(gameState)) {
      return this.evaluateTerminal(gameState);
    }
    
    // Selection phase - traverse tree using UCB1
    if (node.visits > 0 && node.children.size > 0) {
      const action = this.selectAction(node);
      let child = node.children.get(action);
      
      if (!child) {
        // Expansion phase - add new child
        const nextState = this.applyAction(gameState, action);
        child = this.createNode(nextState, node, action);
        node.children.set(action, child);
      }
      
      const reward = this.iterate(
        this.applyAction(gameState, action),
        child
      );
      
      // Backpropagation phase
      this.backpropagate(node, reward);
      return reward;
    }
    
    // Leaf node - simulate
    return this.simulate(gameState);
  }
  
  /**
   * UCB1 formula for action selection
   * Balances exploration vs exploitation
   */
  private selectAction(node: MCTSNode): Action {
    let bestAction: Action | null = null;
    let bestValue = -Infinity;
    
    const parentVisits = Math.log(node.visits);
    
    for (const action of node.availableActions) {
      const child = node.children.get(action);
      
      let value: number;
      if (!child || child.visits === 0) {
        // Unvisited node - infinite UCB value
        value = Infinity;
      } else {
        // UCB1 formula: exploitation + exploration
        const exploitation = child.totalReward / child.visits;
        const exploration = this.config.explorationConstant * 
                          Math.sqrt(parentVisits / child.visits);
        
        if (this.config.usePUCT) {
          // PUCT formula (used in AlphaZero)
          const prior = this.getPrior(action, node);
          value = exploitation + 
                 this.config.explorationConstant * prior * 
                 Math.sqrt(parentVisits) / (1 + child.visits);
        } else if (this.config.useRAVE) {
          // RAVE: Use all-moves-as-first heuristic
          value = this.calculateRAVE(child, node, exploitation, exploration);
        } else {
          value = exploitation + exploration;
        }
      }
      
      if (value > bestValue) {
        bestValue = value;
        bestAction = action;
      }
    }
    
    return bestAction!;
  }
  
  /**
   * Progressive widening - gradually increase action space
   * Important for continuous betting in no-limit poker
   */
  private getAvailableActions(gameState: GameState, node: MCTSNode): Action[] {
    if (!this.config.progressiveWidening) {
      return this.getAllLegalActions(gameState);
    }
    
    // Progressive widening formula
    const k = 10; // Widening parameter
    const alpha = 0.5; // Another widening parameter
    const maxActions = Math.ceil(k * Math.pow(node.visits, alpha));
    
    const allActions = this.getAllLegalActions(gameState);
    
    if (allActions.length <= maxActions) {
      return allActions;
    }
    
    // Return subset of actions based on heuristic
    return this.selectTopActions(allActions, maxActions, gameState);
  }
  
  /**
   * Simulation (rollout) phase
   * Play random game to terminal state
   */
  private simulate(gameState: GameState): number {
    let state = { ...gameState };
    let depth = 0;
    
    while (!this.isTerminal(state) && depth < this.config.simulationDepth) {
      // Use heuristic policy for better simulations
      const action = this.rolloutPolicy(state);
      state = this.applyAction(state, action);
      depth++;
    }
    
    return this.evaluateTerminal(state);
  }
  
  /**
   * Rollout policy - can be random or use heuristics
   * Better policy = better MCTS performance
   */
  private rolloutPolicy(gameState: GameState): Action {
    const actions = this.getAllLegalActions(gameState);
    
    // Use simple heuristics for poker
    if (Math.random() < 0.8) {
      // 80% of time use heuristic
      return this.heuristicAction(gameState, actions);
    } else {
      // 20% random for exploration
      return actions[Math.floor(Math.random() * actions.length)];
    }
  }
  
  /**
   * Simple poker heuristics for rollout policy
   */
  private heuristicAction(gameState: GameState, actions: Action[]): Action {
    // Simplified heuristics
    const hand = this.evaluateHand(gameState);
    
    if (hand.strength > 0.8) {
      // Strong hand - prefer betting/raising
      if (actions.includes('raise')) return 'raise';
      if (actions.includes('call')) return 'call';
    } else if (hand.strength > 0.5) {
      // Medium hand - prefer checking/calling
      if (actions.includes('check')) return 'check';
      if (actions.includes('call')) return 'call';
    } else {
      // Weak hand - prefer checking/folding
      if (actions.includes('check')) return 'check';
      if (actions.includes('fold')) return 'fold';
    }
    
    // Default to first legal action
    return actions[0];
  }
  
  /**
   * Backpropagation - update statistics up the tree
   */
  private backpropagate(node: MCTSNode, reward: number): void {
    let current: MCTSNode | null = node;
    
    while (current) {
      current.visits++;
      current.totalReward += reward;
      current = current.parent;
    }
  }
  
  /**
   * RAVE (Rapid Action Value Estimation)
   * Uses all-moves-as-first heuristic for faster convergence
   */
  private calculateRAVE(
    child: MCTSNode,
    parent: MCTSNode,
    exploitation: number,
    exploration: number
  ): number {
    // RAVE statistics
    const raveVisits = this.getRaveVisits(child);
    const raveReward = this.getRaveReward(child);
    
    if (raveVisits === 0) {
      return exploitation + exploration;
    }
    
    // RAVE value
    const raveValue = raveReward / raveVisits;
    
    // Blend RAVE with UCB using decreasing weight
    const beta = Math.sqrt(500 / (500 + child.visits));
    
    return (1 - beta) * (exploitation + exploration) + beta * raveValue;
  }
  
  /**
   * Determinization for IS-MCTS
   * Sample possible opponent hands
   */
  private determinize(gameState: GameState): GameState {
    // Create a copy of game state
    const determinized = { ...gameState };
    
    // Sample opponent's hidden cards from remaining deck
    const deck = this.getRemainingDeck(gameState);
    const shuffled = this.shuffle(deck);
    
    // Assign cards to opponents
    let cardIndex = 0;
    for (const player of determinized.players) {
      if (!player.isHero && player.cards.length === 0) {
        player.cards = [
          shuffled[cardIndex++],
          shuffled[cardIndex++]
        ] as [Card, Card];
      }
    }
    
    return determinized;
  }
  
  /**
   * Select best action after search completes
   */
  private selectBestAction(root: MCTSNode): Action {
    let bestAction: Action | null = null;
    let bestVisits = -1;
    
    for (const [action, child] of root.children) {
      // Most visited = most robust choice
      if (child.visits > bestVisits) {
        bestVisits = child.visits;
        bestAction = action;
      }
    }
    
    // Log statistics for debugging
    console.log('MCTS Statistics:');
    for (const [action, child] of root.children) {
      const avgReward = child.visits > 0 ? child.totalReward / child.visits : 0;
      console.log(`  ${action}: visits=${child.visits}, avg=${avgReward.toFixed(3)}`);
    }
    
    return bestAction!;
  }
  
  // Helper methods
  private createNode(
    gameState: GameState,
    parent: MCTSNode | null,
    action: Action | null
  ): MCTSNode {
    const infoSet = this.getInfoSet(gameState);
    const player = this.getCurrentPlayer(gameState);
    
    return {
      infoSet,
      visits: 0,
      totalReward: 0,
      children: new Map(),
      parent,
      action,
      availableActions: this.getAllLegalActions(gameState),
      player,
      reachProbabilities: new Map(),
    };
  }
  
  private getInfoSet(gameState: GameState): string {
    // Create unique identifier for information set
    // Includes visible information but not opponent's hidden cards
    const hero = gameState.players.find(p => p.isHero)!;
    return `${hero.cards.join('')}-${gameState.board.join('')}-${gameState.history.map(h => h.action).join('')}`;
  }
  
  private getCurrentPlayer(gameState: GameState): number {
    const activePlayer = gameState.players.find(p => p.id === gameState.actionOn);
    return activePlayer?.isHero ? 0 : 1;
  }
  
  private isTerminal(gameState: GameState): boolean {
    // Game ends when only one player remains or showdown
    const activePlayers = gameState.players.filter(p => !p.hasFolded);
    return activePlayers.length === 1 || 
           (gameState.street === 'river' && this.isBettingComplete(gameState));
  }
  
  private isBettingComplete(gameState: GameState): boolean {
    const activePlayers = gameState.players.filter(p => !p.hasFolded);
    return activePlayers.every(p => 
      p.currentBet === gameState.currentBet || p.stack === 0
    );
  }
  
  private evaluateTerminal(gameState: GameState): number {
    // Return reward from hero's perspective
    const hero = gameState.players.find(p => p.isHero)!;
    
    if (hero.hasFolded) {
      return -hero.totalInvested;
    }
    
    const activePlayers = gameState.players.filter(p => !p.hasFolded);
    if (activePlayers.length === 1) {
      return gameState.pot - hero.totalInvested;
    }
    
    // Showdown - simplified
    return Math.random() < 0.5 ? gameState.pot - hero.totalInvested : -hero.totalInvested;
  }
  
  private getAllLegalActions(gameState: GameState): Action[] {
    // Simplified - would use game engine in production
    const actions: Action[] = ['fold'];
    
    const currentPlayer = gameState.players.find(p => p.id === gameState.actionOn)!;
    if (gameState.currentBet === currentPlayer.currentBet) {
      actions.push('check');
    } else {
      actions.push('call');
    }
    
    if (currentPlayer.stack > gameState.currentBet - currentPlayer.currentBet) {
      actions.push('raise');
    }
    
    return actions;
  }
  
  private applyAction(gameState: GameState, action: Action): GameState {
    // Apply action to game state - would use game engine
    const newState = JSON.parse(JSON.stringify(gameState)); // Deep copy
    
    // Simplified action application
    const player = newState.players.find((p: any) => p.id === newState.actionOn)!;
    
    switch (action) {
      case 'fold':
        player.hasFolded = true;
        break;
      case 'call':
        const toCall = newState.currentBet - player.currentBet;
        player.stack -= toCall;
        player.currentBet = newState.currentBet;
        player.totalInvested += toCall;
        newState.pot += toCall;
        break;
      case 'check':
        // No change
        break;
      case 'raise':
        const raiseAmount = newState.pot * 0.75; // 75% pot bet
        player.stack -= raiseAmount;
        player.currentBet += raiseAmount;
        player.totalInvested += raiseAmount;
        newState.pot += raiseAmount;
        newState.currentBet = player.currentBet;
        break;
    }
    
    // Move to next player
    this.advanceGame(newState);
    
    return newState;
  }
  
  private advanceGame(gameState: GameState): void {
    // Simplified game advancement
    const currentIndex = gameState.players.findIndex((p: any) => p.id === gameState.actionOn);
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    gameState.actionOn = gameState.players[nextIndex].id;
  }
  
  private selectTopActions(actions: Action[], maxActions: number, gameState: GameState): Action[] {
    // Select best actions based on heuristic
    // In production, might use neural network or hand strength
    return actions.slice(0, maxActions);
  }
  
  private getPrior(action: Action, node: MCTSNode): number {
    // Prior probability for PUCT
    // Could use neural network like AlphaZero
    return 1.0 / node.availableActions.length;
  }
  
  private getRaveVisits(node: MCTSNode): number {
    // Get RAVE visit count
    // Simplified - would track AMAF statistics
    return node.visits;
  }
  
  private getRaveReward(node: MCTSNode): number {
    // Get RAVE reward
    // Simplified - would track AMAF statistics
    return node.totalReward;
  }
  
  private evaluateHand(gameState: GameState): { strength: number } {
    // Evaluate current hand strength
    // Simplified - would use real hand evaluator
    return { strength: Math.random() };
  }
  
  private getRemainingDeck(gameState: GameState): Card[] {
    // Get cards not yet seen
    // Simplified for example
    const allCards: Card[] = ['A♠', 'K♠', 'Q♠', 'J♠'] as Card[];
    return allCards;
  }
  
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Export singleton instance
export const mcts = new ISMCTS();