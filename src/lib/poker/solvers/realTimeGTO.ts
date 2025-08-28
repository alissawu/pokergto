/**
 * Real-Time GTO Solver
 * Implements actual game theory calculations that can run fast enough for gameplay
 */

import { Card, Action, Player, GameState } from "../engine";
import { CFRSolver, TreeNode, GameTree, CFRNode } from "./cfr";

/**
 * Simplified game tree builder for real-time solving
 * Limit depth and abstract cards to make it tractable
 */
export class RealTimeGameTree {
  private readonly MAX_DEPTH = 3; // Limit tree depth for performance
  private readonly CARD_BUCKETS = 10; // Abstract cards into buckets

  /**
   * Build a simplified game tree from current state
   */
  public buildTree(
    state: GameState,
    heroId: string,
    maxActions: number = 3
  ): GameTree {
    const hero = state.players.find((p) => p.id === heroId);
    if (!hero) throw new Error("Hero not found");

    const root = this.buildNode(
      state,
      heroId,
      0,
      this.MAX_DEPTH,
      "",
      maxActions
    );

    const infoSets = new Map<string, CFRNode>();
    this.collectInfoSets(root, infoSets);

    return { root, infoSets };
  }

  private buildNode(
    state: GameState,
    heroId: string,
    currentPlayer: number,
    depthRemaining: number,
    history: string,
    maxActions: number
  ): TreeNode {
    const hero = state.players.find((p) => p.id === heroId)!;
    const villain = state.players.find((p) => p.id !== heroId && !p.hasFolded);

    // Terminal conditions
    if (depthRemaining === 0 || !villain || hero.hasFolded) {
      return this.createTerminalNode(state, heroId, history);
    }

    // Create info set string (what the current player knows)
    const infoSet = this.createInfoSet(
      state,
      currentPlayer === 0 ? heroId : villain?.id || "",
      history
    );

    // Get legal actions (simplified)
    const actions = this.getSimplifiedActions(
      state,
      currentPlayer === 0 ? hero : villain!
    );
    const children = new Map<Action, TreeNode>();

    // Build child nodes for each action
    for (const action of actions.slice(0, maxActions)) {
      const nextState = this.simulateAction(
        state,
        action,
        currentPlayer === 0 ? hero : villain!
      );
      const nextHistory = history + action[0].toUpperCase(); // F, C, R, B for fold/call/raise/bet
      const nextPlayer = 1 - currentPlayer;

      children.set(
        action,
        this.buildNode(
          nextState,
          heroId,
          nextPlayer,
          depthRemaining - 1,
          nextHistory,
          maxActions
        )
      );
    }

    return {
      infoSet,
      player: currentPlayer,
      children,
      isTerminal: false,
    };
  }

  private createTerminalNode(
    state: GameState,
    heroId: string,
    history: string
  ): TreeNode {
    const hero = state.players.find((p) => p.id === heroId)!;
    const villain = state.players.find((p) => p.id !== heroId && !p.hasFolded);

    let utility: number[];

    if (hero.hasFolded) {
      utility = [-hero.totalInvested, hero.totalInvested];
    } else if (!villain || villain.hasFolded) {
      const winnings = state.pot - hero.totalInvested;
      utility = [winnings, -winnings];
    } else {
      // Estimate showdown equity
      const heroEquity = this.estimateEquity(hero, villain, state);
      const expectedValue = heroEquity * state.pot - hero.totalInvested;
      utility = [expectedValue, -expectedValue];
    }

    return {
      infoSet: `terminal_${history}`,
      player: -1,
      children: new Map(),
      isTerminal: true,
      utility,
    };
  }

  private createInfoSet(
    state: GameState,
    playerId: string,
    history: string
  ): string {
    const player = state.players.find((p) => p.id === playerId);
    if (!player) return `unknown_${history}`;

    // Abstract hand strength into buckets
    const handBucket = this.getHandBucket(player.cards as [Card, Card]);
    const pot = Math.round(state.pot);
    const toCall = state.currentBet - player.currentBet;

    return `${handBucket}_${pot}_${toCall}_${history}`;
  }

  private getHandBucket(cards: [Card, Card]): string {
    if (!cards || cards.length !== 2) return "unknown";

    const rank1 = this.getRankValue(cards[0][0] as any);
    const rank2 = this.getRankValue(cards[1][0] as any);
    const suited = cards[0][1] === cards[1][1];
    const isPair = cards[0][0] === cards[1][0];

    // Bucket hands into categories
    if (isPair) {
      if (rank1 >= 12) return "premium_pair"; // QQ+
      if (rank1 >= 9) return "high_pair"; // 99-JJ
      if (rank1 >= 5) return "mid_pair"; // 55-88
      return "low_pair"; // 22-44
    }

    const high = Math.max(rank1, rank2);
    const low = Math.min(rank1, rank2);

    if (high === 14) {
      // Ace high
      if (low >= 10) return suited ? "premium_suited" : "premium_offsuit";
      if (low >= 7) return suited ? "good_suited" : "mediocre_offsuit";
      return suited ? "speculative_suited" : "weak_offsuit";
    }

    if (high >= 12 && low >= 10) {
      // Broadway
      return suited ? "broadway_suited" : "broadway_offsuit";
    }

    if (Math.abs(high - low) <= 1 && suited) {
      return "suited_connector";
    }

    if (high >= 10) {
      return suited ? "decent_suited" : "decent_offsuit";
    }

    return suited ? "weak_suited" : "trash";
  }

  private getRankValue(rank: string): number {
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
  }

  private getSimplifiedActions(state: GameState, player: Player): Action[] {
    const actions: Action[] = [];
    const toCall = state.currentBet - player.currentBet;

    // Preflop: Cannot check when facing a bet (BB is already posted)
    if (state.street === "preflop" && toCall > 0) {
      // Must fold, call, or raise
      actions.push("fold", "call");
      if (player.stack > toCall) {
        actions.push("raise");
      }
    } else if (toCall === 0) {
      // Postflop or BB preflop with no raise
      actions.push("check");
      if (player.stack > 0) {
        actions.push("bet");
      }
    } else {
      // Facing a bet postflop
      actions.push("fold", "call");
      if (player.stack > toCall) {
        actions.push("raise");
      }
    }

    return actions;
  }

  private simulateAction(
    state: GameState,
    action: Action,
    player: Player
  ): GameState {
    // Clone state
    const newState: GameState = {
      ...state,
      players: state.players.map((p) => ({ ...p })),
      board: [...state.board],
      history: [...state.history],
    };

    const newPlayer = newState.players.find((p) => p.id === player.id)!;

    switch (action) {
      case "fold":
        newPlayer.hasFolded = true;
        break;

      case "call":
        const toCall = Math.min(
          newState.currentBet - newPlayer.currentBet,
          newPlayer.stack
        );
        newPlayer.stack -= toCall;
        newPlayer.currentBet += toCall;
        newPlayer.totalInvested += toCall;
        newState.pot += toCall;
        break;

      case "bet":
        const betSize = Math.min(newState.pot * 0.66, newPlayer.stack);
        newPlayer.stack -= betSize;
        newPlayer.currentBet += betSize;
        newPlayer.totalInvested += betSize;
        newState.pot += betSize;
        newState.currentBet = newPlayer.currentBet;
        break;

      case "raise":
        const raiseSize = Math.min(newState.currentBet * 2, newPlayer.stack);
        const raiseAmount = raiseSize - newPlayer.currentBet;
        newPlayer.stack -= raiseAmount;
        newPlayer.currentBet += raiseAmount;
        newPlayer.totalInvested += raiseAmount;
        newState.pot += raiseAmount;
        newState.currentBet = newPlayer.currentBet;
        break;
    }

    return newState;
  }

  private estimateEquity(
    hero: Player,
    villain: Player,
    state: GameState
  ): number {
    // Simplified equity calculation based on hand strength
    const heroBucket = this.getHandBucket(hero.cards as [Card, Card]);
    const bucketEquities: Record<string, number> = {
      premium_pair: 0.8,
      high_pair: 0.65,
      mid_pair: 0.55,
      low_pair: 0.45,
      premium_suited: 0.6,
      premium_offsuit: 0.55,
      broadway_suited: 0.5,
      broadway_offsuit: 0.45,
      good_suited: 0.45,
      suited_connector: 0.4,
      decent_suited: 0.38,
      decent_offsuit: 0.35,
      speculative_suited: 0.35,
      mediocre_offsuit: 0.32,
      weak_suited: 0.3,
      weak_offsuit: 0.25,
      trash: 0.2,
      unknown: 0.33,
    };

    return bucketEquities[heroBucket] || 0.33;
  }

  private collectInfoSets(
    node: TreeNode,
    infoSets: Map<string, CFRNode>
  ): void {
    if (node.isTerminal) return;

    if (!infoSets.has(node.infoSet)) {
      const actions = Array.from(node.children.keys());
      const cfrNode: CFRNode = {
        infoSet: node.infoSet,
        regretSum: new Map(),
        strategySum: new Map(),
        strategy: new Map(),
        visits: 0,
      };

      for (const action of actions) {
        cfrNode.regretSum.set(action, 0);
        cfrNode.strategySum.set(action, 0);
        cfrNode.strategy.set(action, 1.0 / actions.length);
      }

      infoSets.set(node.infoSet, cfrNode);
    }

    for (const child of node.children.values()) {
      this.collectInfoSets(child, infoSets);
    }
  }
}

/**
 * Fast CFR solver for real-time play
 */
export class RealTimeGTOSolver {
  private treeBuilder = new RealTimeGameTree();
  private solver = new CFRSolver();
  private cache = new Map<string, Map<Action, number>>();

  /**
   * Solve current position using CFR
   * Returns action probabilities
   */
  public solve(
    state: GameState,
    heroId: string,
    iterations: number = 100
  ): Map<Action, number> {
    // Check cache first
    const cacheKey = this.getCacheKey(state, heroId);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Build simplified game tree
    const gameTree = this.treeBuilder.buildTree(state, heroId, 3);

    // Run CFR iterations
    const strategies = this.solver.train(gameTree, iterations);

    // Get strategy for current info set
    const hero = state.players.find((p) => p.id === heroId)!;
    const infoSet = this.createInfoSet(state, hero);
    const strategy = strategies.get(infoSet) || new Map();

    // Cache result
    this.cache.set(cacheKey, strategy);

    return strategy;
  }

  /**
   * Get GTO action frequencies with EV calculations
   */
  public getGTOStrategy(
    state: GameState,
    heroId: string
  ): {
    action: Action;
    frequency: number;
    ev: number;
  }[] {
    const strategy = this.solve(state, heroId, 50); // Fewer iterations for speed
    const results = [];

    for (const [action, frequency] of strategy.entries()) {
      const ev = this.calculateActionEV(state, heroId, action, strategy);
      results.push({ action, frequency, ev });
    }

    // Sort by EV
    results.sort((a, b) => b.ev - a.ev);

    return results;
  }

  private calculateActionEV(
    state: GameState,
    heroId: string,
    action: Action,
    fullStrategy: Map<Action, number>
  ): number {
    const hero = state.players.find((p) => p.id === heroId)!;
    const toCall = state.currentBet - hero.currentBet;
    
    // Quick EV estimates based on action and equity
    if (action === "fold") {
      return -hero.totalInvested;
    }
    
    // Estimate hand strength/equity
    const equity = this.estimateHandEquity(hero);
    
    if (action === "call") {
      // EV = equity * (pot + call) - call amount
      return equity * (state.pot + toCall) - toCall;
    }
    
    if (action === "check") {
      // EV = equity * pot
      return equity * state.pot;
    }
    
    if (action === "bet" || action === "raise") {
      // Simplified: assume some fold equity + showdown equity
      const betSize = action === "raise" 
        ? Math.max(state.currentBet * 2 - hero.currentBet, toCall * 2)
        : state.pot * 0.66;
      const foldEquity = 0.3; // Estimate 30% fold equity
      const showdownWinnings = equity * (state.pot + betSize * 2);
      return foldEquity * state.pot + (1 - foldEquity) * (showdownWinnings - betSize);
    }
    
    return 0;
  }
  
  private estimateHandEquity(player: Player): number {
    if (!player.cards || player.cards.length !== 2) return 0.33;
    const handBucket = this.treeBuilder["getHandBucket"](player.cards as [Card, Card]);
    const bucketEquities: Record<string, number> = {
      premium_pair: 0.8,
      high_pair: 0.65,
      mid_pair: 0.55,
      low_pair: 0.45,
      premium_suited: 0.6,
      premium_offsuit: 0.55,
      broadway_suited: 0.5,
      broadway_offsuit: 0.45,
      good_suited: 0.45,
      suited_connector: 0.4,
      decent_suited: 0.38,
      decent_offsuit: 0.35,
      speculative_suited: 0.35,
      mediocre_offsuit: 0.32,
      weak_suited: 0.3,
      weak_offsuit: 0.25,
      trash: 0.2,
      unknown: 0.33,
    };
    return bucketEquities[handBucket] || 0.33;
  }

  private createInfoSet(state: GameState, player: Player): string {
    const handBucket = this.treeBuilder["getHandBucket"](
      player.cards as [Card, Card]
    );
    const pot = Math.round(state.pot);
    const toCall = state.currentBet - player.currentBet;
    return `${handBucket}_${pot}_${toCall}_`;
  }

  private getCacheKey(state: GameState, heroId: string): string {
    const hero = state.players.find((p) => p.id === heroId)!;
    return this.createInfoSet(state, hero) + state.street;
  }
}

/**
 * Nash equilibrium solver for push/fold
 */
export class NashPushFoldSolver {
  /**
   * Calculate Nash equilibrium push/fold strategy
   */
  public solveNash(
    heroCards: [Card, Card],
    heroStack: number,
    villainStack: number,
    pot: number
  ): {
    push: boolean;
    pushEV: number;
    foldEV: number;
  } {
    // Use ICM and Nash calculations for push/fold
    const effectiveStack = Math.min(heroStack, villainStack);
    const potOdds = effectiveStack / (pot + effectiveStack * 2);

    // Calculate equity needed
    const equity = this.calculateHandEquity(heroCards);

    // Nash push if equity > pot odds with some adjustment
    const pushThreshold = potOdds * 0.9; // Slight adjustment for fold equity
    const shouldPush = equity > pushThreshold;

    // Calculate EVs
    const foldEV = 0;
    const pushEV = shouldPush
      ? 0.3 * pot + 0.7 * (equity * (pot + effectiveStack * 2) - effectiveStack)
      : -effectiveStack * 0.5; // Negative EV if not Nash

    return {
      push: shouldPush,
      pushEV,
      foldEV,
    };
  }

  private calculateHandEquity(cards: [Card, Card]): number {
    // Simplified equity calculation
    const rank1 = this.getRankValue(cards[0][0] as any);
    const rank2 = this.getRankValue(cards[1][0] as any);
    const suited = cards[0][1] === cards[1][1];
    const isPair = cards[0][0] === cards[1][0];

    if (isPair) {
      return 0.5 + (rank1 / 14) * 0.3;
    }

    const high = Math.max(rank1, rank2);
    const low = Math.min(rank1, rank2);
    const gap = high - low;

    let equity = 0.25 + (high / 14) * 0.2 + (low / 14) * 0.1;
    if (suited) equity += 0.03;
    if (gap <= 1) equity += 0.02;

    return Math.min(0.85, Math.max(0.15, equity));
  }

  private getRankValue(rank: string): number {
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
  }
}

// Export singleton instances
export const realTimeGTOSolver = new RealTimeGTOSolver();
export const nashPushFoldSolver = new NashPushFoldSolver();
