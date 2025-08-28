/**
 * Monte Carlo Tree Search (MCTS) for Poker
 * - UCB1 (Upper Confidence Bound)
 * - Information Set MCTS (IS-MCTS) for imperfect information
 * - Optional PUCT / RAVE hooks
 */

import { Card, Action, GameState } from "../engine";
import {
  bestOf7,
  fullDeck,
  removeCards,
  shuffleInPlace,
  compareScore,
} from "./eval";

/**
 * MCTS Node for poker
 * Handles imperfect information through information sets
 */
export interface MCTSNode {
  infoSet: string; // Information set identifier
  visits: number; // Number of times visited
  totalReward: number; // Cumulative reward (from hero perspective)
  children: Map<Action, MCTSNode>;
  parent: MCTSNode | null;
  action: Action | null; // Action that led to this node
  availableActions: Action[];
  player: number; // 0 = hero, 1 = not-hero (for HU; extend for multiway)
  // IS-MCTS specific (placeholders for future use)
  reachProbabilities: Map<string, number>;
  privateCards?: Card[];
}

/**
 * Configuration for MCTS
 */
export interface MCTSConfig {
  explorationConstant: number; // C in UCB1 formula (typically √2)
  simulationDepth: number; // Max depth for rollouts
  timeLimit: number; // Milliseconds per decision
  usePUCT: boolean; // Use PUCT like AlphaZero
  useRAVE: boolean; // Use RAVE for faster convergence
  progressiveWidening: boolean; // (Not wired by default in this minimal version)
}

/**
 * Information Set Monte Carlo Tree Search
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
      progressiveWidening: false,
      ...config,
    };
  }

  /**
   * Main MCTS search
   * Returns best action after running simulations
   */
  public search(gameState: GameState, iterations?: number): Action {
    const startTime = Date.now();
    const maxIterations = iterations ?? Infinity;
    let iter = 0;

    // Initialize root fresh for each decision point
    this.root = this.createNode(gameState, null, null);

    while (
      iter < maxIterations &&
      Date.now() - startTime < this.config.timeLimit
    ) {
      // Determinization - sample opponents' hidden cards from remaining deck
      const determinization = this.determinize(gameState);

      // Run one iteration of MCTS (Selection -> Expansion -> Simulation -> Backprop)
      this.iterate(determinization, this.root);

      iter++;
    }

    return this.selectBestAction(this.root);
  }

  /**
   * One iteration of MCTS
   * Selection -> Expansion -> Simulation -> Backpropagation
   */
  private iterate(gameState: GameState, node: MCTSNode): number {
    // If terminal, return terminal reward
    if (this.isTerminal(gameState)) {
      return this.evaluateTerminal(gameState);
    }

    // Selection (and Expansion when encountering a missing child)
    if (node.visits > 0 && node.children.size > 0) {
      const action = this.selectAction(node);
      let child = node.children.get(action);

      if (!child) {
        const nextState = this.applyAction(gameState, action);
        child = this.createNode(nextState, node, action);
        node.children.set(action, child);
      }

      const reward = this.iterate(this.applyAction(gameState, action), child);
      this.backpropagate(node, reward);
      return reward;
    }

    // Leaf node: expand all currently legal actions and simulate once
    if (node.children.size === 0) {
      for (const a of node.availableActions) {
        // create child stubs to allow future selection branching
        node.children.set(
          a,
          this.createNode(this.applyAction(gameState, a), node, a)
        );
      }
    }

    // Single rollout from this leaf
    const reward = this.simulate(gameState);
    this.backpropagate(node, reward);
    return reward;
  }

  /**
   * UCB1 / PUCT / RAVE selection
   */
  private selectAction(node: MCTSNode): Action {
    let bestAction: Action | null = null;
    let bestValue = -Infinity;

    const parentVisitsLog = Math.log(Math.max(1, node.visits));

    for (const a of node.availableActions) {
      const child = node.children.get(a);
      let value: number;

      if (!child || child.visits === 0) {
        // Encourage trying unvisited actions
        value = Infinity;
      } else {
        const exploitation = child.totalReward / child.visits;
        const exploration =
          this.config.explorationConstant *
          Math.sqrt(parentVisitsLog / child.visits);

        if (this.config.usePUCT) {
          const prior = this.getPrior(a, node);
          value =
            exploitation +
            (this.config.explorationConstant *
              prior *
              Math.sqrt(parentVisitsLog)) /
              (1 + child.visits);
        } else if (this.config.useRAVE) {
          value = this.calculateRAVE(child, node, exploitation, exploration);
        } else {
          value = exploitation + exploration;
        }
      }

      if (value > bestValue) {
        bestValue = value;
        bestAction = a;
      }
    }

    return bestAction!;
  }

  /**
   * Prior for PUCT (uniform by default).
   * Plug in NN policy or heuristics here if you have them.
   */
  private getPrior(action: Action, node: MCTSNode): number {
    // Uniform prior
    return 1 / Math.max(1, node.availableActions.length);
  }

  /**
   * Single playout (rollout) until terminal or depth cap
   */
  private simulate(gameState: GameState): number {
    let state = this.cloneState(gameState);
    let depth = 0;

    while (!this.isTerminal(state) && depth < this.config.simulationDepth) {
      const actions = this.getAllLegalActions(state);
      const action =
        Math.random() < 0.8
          ? this.heuristicAction(state, actions)
          : actions[Math.floor(Math.random() * actions.length)];

      state = this.applyAction(state, action);
      depth++;
    }

    return this.evaluateTerminal(state);
  }

  /**
   * Very simple heuristic policy
   * (You can plug strength-aware heuristics here later)
   */
  private heuristicAction(_state: GameState, actions: Action[]): Action {
    if (actions.includes("raise")) return "raise";
    if (actions.includes("call")) return "call";
    if (actions.includes("check")) return "check";
    return "fold";
  }

  /**
   * Backpropagation
   */
  private backpropagate(node: MCTSNode, reward: number): void {
    let cur: MCTSNode | null = node;
    while (cur) {
      cur.visits++;
      cur.totalReward += reward;
      cur = cur.parent;
    }
  }

  /**
   * RAVE (placeholder blend with UCB)
   */
  private calculateRAVE(
    child: MCTSNode,
    _parent: MCTSNode,
    exploitation: number,
    exploration: number
  ): number {
    const raveVisits = this.getRaveVisits(child);
    const raveReward = this.getRaveReward(child);
    if (raveVisits === 0) return exploitation + exploration;
    const raveValue = raveReward / raveVisits;
    const beta = Math.sqrt(500 / (500 + child.visits));
    return (1 - beta) * (exploitation + exploration) + beta * raveValue;
  }

  /**
   * Determinization for IS-MCTS
   * Sample possible opponent hands from a FULL remaining deck
   */
  private determinize(gameState: GameState): GameState {
    const det = this.cloneState(gameState);

    // Known cards: all currently visible (board + any known hole cards)
    const known: Card[] = [
      ...det.board,
      ...det.players.flatMap((p) => p.cards ?? []),
    ];

    // Remaining deck = full deck minus known
    let deck = removeCards(fullDeck(), known);
    shuffleInPlace(deck);

    // Assign two hidden cards to any non-hero with empty/unknown cards
    for (const p of det.players) {
      if (!p.isHero && (!p.cards || p.cards.length === 0)) {
        p.cards = [deck.pop()!, deck.pop()!] as [Card, Card];
      }
    }

    return det;
  }

  /**
   * Terminal check (very simplified)
   * Terminal when:
   *  - Only one player remains (others folded), OR
   *  - River street and betting is complete (showdown)
   */
  private isTerminal(state: GameState): boolean {
    const active = state.players.filter((p) => !p.hasFolded);
    if (active.length <= 1) return true;
    return state.street === "river" && this.isBettingComplete(state);
  }

  private isBettingComplete(state: GameState): boolean {
    const active = state.players.filter((p) => !p.hasFolded);
    return active.every(
      (p) => p.currentBet === state.currentBet || p.stack === 0
    );
  }

  /**
   * Proper showdown evaluation using bestOf7 (HU assumption)
   * Returns chip EV from hero's perspective:
   *  - win:  pot - heroInvested
   *  - lose: -heroInvested
   *  - tie:  pot/2 - heroInvested
   *
   * NOTE: For multiway & side-pots you should extend this logic.
   */
  private evaluateTerminal(state: GameState): number {
    const hero = state.players.find((p) => p.isHero)!;

    // If hero folded, loses what they invested
    if (hero.hasFolded) {
      return -hero.totalInvested;
    }

    // If everyone else folded, hero wins the pot
    const active = state.players.filter((p) => !p.hasFolded);
    if (active.length === 1 && active[0].isHero) {
      return state.pot - hero.totalInvested;
    }

    // If not at showdown yet (e.g., all-in earlier without board complete),
    // you can add board-rollout equities. For now, treat as neutral.
    if (state.street !== "river" || !this.isBettingComplete(state)) {
      return 0;
    }

    // Heads-up showdown (extend to multiway as needed)
    const villain = state.players.find((p) => !p.isHero && !p.hasFolded);
    if (!villain) {
      // Fallback: if somehow no opponent detected, treat as hero win
      return state.pot - hero.totalInvested;
    }

    const hero7 = [...hero.cards, ...state.board] as Card[];
    const vill7 = [...villain.cards, ...state.board] as Card[];

    const hScore = bestOf7(hero7);
    const vScore = bestOf7(vill7);
    const cmp = compareScore(hScore, vScore);

    if (cmp > 0) return state.pot - hero.totalInvested; // hero wins
    if (cmp < 0) return -hero.totalInvested; // hero loses
    return state.pot / 2 - hero.totalInvested; // split
  }

  /**
   * Generate legal actions (very simplified)
   * Assumes discrete actions: fold, check/call, raise (pot*0.75 sizing)
   */
  private getAllLegalActions(state: GameState): Action[] {
    const actions: Action[] = ["fold"];
    const me = state.players.find((p) => p.id === state.actionOn)!;

    if (state.currentBet === me.currentBet) actions.push("check");
    else actions.push("call");

    const toCall = state.currentBet - me.currentBet;
    if (me.stack > toCall) actions.push("raise");

    return actions;
  }

  /**
   * Apply action to a cloned state (very simplified, no side-pots, etc.)
   */
  private applyAction(state: GameState, action: Action): GameState {
    const s = this.cloneState(state);
    const p = s.players.find((pl) => pl.id === s.actionOn)!;

    switch (action) {
      case "fold": {
        p.hasFolded = true;
        break;
      }
      case "check": {
        // nothing
        break;
      }
      case "call": {
        const toCall = s.currentBet - p.currentBet;
        const amt = Math.max(0, Math.min(p.stack, toCall));
        p.stack -= amt;
        p.currentBet += amt;
        p.totalInvested += amt;
        s.pot += amt;
        break;
      }
      case "raise": {
        const toCall = s.currentBet - p.currentBet;
        const raiseAmount = Math.max(1, Math.floor(s.pot * 0.75));
        const totalPut = toCall + raiseAmount;
        const amt = Math.max(0, Math.min(p.stack, totalPut));
        p.stack -= amt;
        p.currentBet += amt;
        p.totalInvested += amt;
        s.pot += amt;
        s.currentBet = p.currentBet;
        break;
      }
    }

    this.advanceTurn(s);
    return s;
  }

  /**
   * Advance action to next player (table order assumed to be array order)
   * (Street advancement, blinds, min-raises, etc. should be handled in your engine.)
   */
  private advanceTurn(s: GameState): void {
    const i = s.players.findIndex((pl) => pl.id === s.actionOn);
    const next = (i + 1) % s.players.length;
    s.actionOn = s.players[next].id;
  }

  /**
   * Create a node for the current state
   */
  private createNode(
    state: GameState,
    parent: MCTSNode | null,
    action: Action | null
  ): MCTSNode {
    const infoSet = this.getInfoSet(state);
    const player = this.getCurrentPlayerIndex(state);

    return {
      infoSet,
      visits: 0,
      totalReward: 0,
      children: new Map(),
      parent,
      action,
      availableActions: this.getAllLegalActions(state),
      player,
      reachProbabilities: new Map(),
    };
  }

  /**
   * Info set key: only include public info + hero private info
   * (Avoid including opponents' unknown hole cards!)
   */
  private getInfoSet(state: GameState): string {
    const hero = state.players.find((p) => p.isHero)!;
    const heroCards = hero.cards?.join("") ?? "";
    const board = state.board.join("");
    const history = state.history?.map((h: any) => h.action).join("") ?? "";
    const pot = state.pot;
    const bet = state.currentBet;
    return `${heroCards}|${board}|${history}|pot${pot}|bet${bet}|on:${state.actionOn}`;
  }

  private getCurrentPlayerIndex(state: GameState): number {
    const active = state.players.find((p) => p.id === state.actionOn);
    return active?.isHero ? 0 : 1;
  }

  private selectBestAction(root: MCTSNode): Action {
    let best: Action | null = null;
    let mostVisits = -1;

    for (const [a, child] of root.children) {
      if (child.visits > mostVisits) {
        mostVisits = child.visits;
        best = a;
      }
    }

    // Debug dump (optional)
    // for (const [a, child] of root.children) {
    //   const avg = child.visits ? child.totalReward / child.visits : 0;
    //   console.log(`${a}: visits=${child.visits}, avg=${avg.toFixed(3)}`);
    // }

    return best!;
  }

  // RAVE placeholders (no AMAF tables here; you can wire them later)
  private getRaveVisits(node: MCTSNode): number {
    return node.visits;
  }
  private getRaveReward(node: MCTSNode): number {
    return node.totalReward;
  }

  private cloneState<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

// Export singleton instance
export const mcts = new ISMCTS();
