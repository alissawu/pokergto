/**
 * Counterfactual Regret Minimization (CFR) Implementation
 */

import { Card, Action } from "../engine";

// Information set - the game state from a player's perspective
export interface InfoSet {
  cards: Card[];
  history: Action[];
  board: Card[];
  pot: number;
  toString(): string;
}

// Node in the game tree
export interface CFRNode {
  infoSet: string;
  regretSum: Map<Action, number>;
  strategySum: Map<Action, number>;
  strategy: Map<Action, number>;
  visits: number;
}

export interface GameTree {
  root: TreeNode;
  infoSets: Map<string, CFRNode>;
}

export interface TreeNode {
  infoSet: string;
  player: number; // 0, 1, or -1 for chance/nature
  children: Map<Action, TreeNode>;
  isTerminal: boolean;
  utility?: number[];
}

/**
 * Main CFR Solver
 */
export class CFRSolver {
  protected nodes: Map<string, CFRNode> = new Map();
  protected readonly EPSILON = 1e-7;

  public train(
    gameTree: GameTree,
    iterations: number,
    callback?: (iteration: number, exploitability: number) => void
  ): Map<string, Map<Action, number>> {
    const players = 2;

    for (let t = 0; t < iterations; t++) {
      for (let player = 0; player < players; player++) {
        this.cfr(gameTree.root, player, 1, 1);
      }
      if (t % 100 === 0 && callback) {
        const exploitability = this.calculateExploitability(gameTree);
        callback(t, exploitability);
      }
    }

    return this.getAverageStrategies();
  }

  private cfr(
    node: TreeNode,
    player: number,
    reachP0: number,
    reachP1: number
  ): number[] {
    if (node.isTerminal) return node.utility || [0, 0];

    let cfrNode = this.nodes.get(node.infoSet);
    if (!cfrNode) {
      cfrNode = this.createNode(node);
      this.nodes.set(node.infoSet, cfrNode);
    }

    const reachProbs = [reachP0, reachP1];
    const currentReach = reachProbs[node.player];
    const opponentReach = reachProbs[1 - node.player];

    const strategy = this.getStrategy(cfrNode);
    const actions = Array.from(node.children.keys());
    const utilities: Map<Action, number[]> = new Map();
    const nodeUtil = [0, 0];

    for (const action of actions) {
      const child = node.children.get(action)!;
      const actionProb = strategy.get(action) || 0;
      const newReachProbs = [...reachProbs];
      newReachProbs[node.player] *= actionProb;

      const actionUtil = this.cfr(
        child,
        player,
        newReachProbs[0],
        newReachProbs[1]
      );

      utilities.set(action, actionUtil);
      for (let p = 0; p < 2; p++) {
        nodeUtil[p] += actionProb * actionUtil[p];
      }
    }

    if (node.player === player) {
      for (const action of actions) {
        const actionUtil = utilities.get(action)![player];
        const regret = actionUtil - nodeUtil[player];
        const cfRegret = opponentReach * regret;
        const currentRegret = cfrNode.regretSum.get(action) || 0;
        cfrNode.regretSum.set(action, currentRegret + cfRegret);
      }
      for (const action of actions) {
        const strategyProb = strategy.get(action) || 0;
        const currentSum = cfrNode.strategySum.get(action) || 0;
        cfrNode.strategySum.set(
          action,
          currentSum + currentReach * strategyProb
        );
      }
    }

    return nodeUtil;
  }

  protected getStrategy(node: CFRNode): Map<Action, number> {
    const strategy = new Map<Action, number>();
    const actions = Array.from(node.regretSum.keys());
    let sumPositive = 0;
    const posRegrets = new Map<Action, number>();

    for (const a of actions) {
      const r = Math.max(0, node.regretSum.get(a) || 0);
      posRegrets.set(a, r);
      sumPositive += r;
    }

    for (const a of actions) {
      if (sumPositive > 0) {
        strategy.set(a, posRegrets.get(a)! / sumPositive);
      } else {
        strategy.set(a, 1.0 / actions.length); // uniform = part of CFR definition
      }
    }

    node.strategy = strategy;
    return strategy;
  }

  protected getAverageStrategies(): Map<string, Map<Action, number>> {
    const avg = new Map<string, Map<Action, number>>();
    for (const [infoSet, node] of this.nodes) {
      const s = new Map<Action, number>();
      const actions = Array.from(node.strategySum.keys());
      let sum = 0;
      for (const a of actions) sum += node.strategySum.get(a) || 0;
      for (const a of actions) {
        if (sum > 0) s.set(a, (node.strategySum.get(a) || 0) / sum);
        else s.set(a, 1.0 / actions.length);
      }
      avg.set(infoSet, s);
    }
    return avg;
  }

  private calculateExploitability(gameTree: GameTree): number {
    const br0 = this.bestResponse(gameTree.root, 0, 1);
    const br1 = this.bestResponse(gameTree.root, 1, 1);
    return (br0 + br1) / 2;
  }

  private bestResponse(
    node: TreeNode,
    brPlayer: number,
    reach: number
  ): number {
    if (node.isTerminal) {
      return (node.utility || [0, 0])[brPlayer] * reach;
    }
    const cfrNode = this.nodes.get(node.infoSet);
    if (!cfrNode) return 0;
    if (node.player === brPlayer) {
      let maxValue = -Infinity;
      for (const [, child] of node.children) {
        const v = this.bestResponse(child, brPlayer, reach);
        maxValue = Math.max(maxValue, v);
      }
      return maxValue;
    } else {
      let v = 0;
      const strategy = this.getStrategy(cfrNode);
      for (const [action, child] of node.children) {
        const prob = strategy.get(action) || 0;
        v += this.bestResponse(child, brPlayer, reach * prob);
      }
      return v;
    }
  }

  protected createNode(treeNode: TreeNode): CFRNode {
    const actions = Array.from(treeNode.children.keys());
    const node: CFRNode = {
      infoSet: treeNode.infoSet,
      regretSum: new Map(),
      strategySum: new Map(),
      strategy: new Map(),
      visits: 0,
    };
    for (const a of actions) {
      node.regretSum.set(a, 0);
      node.strategySum.set(a, 0);
      node.strategy.set(a, 1.0 / actions.length);
    }
    return node;
  }
}

/**
 * Monte Carlo CFR with full deck + strict sampling
 */
export class MonteCarloCFR extends CFRSolver {
  public trainMCCFR(
    gameTree: GameTree,
    iterations: number,
    scheme: "external" | "outcome" = "external"
  ): Map<string, Map<Action, number>> {
    for (let t = 0; t < iterations; t++) {
      const deck = this.freshShuffledDeck();
      const p0 = this.sampleWithoutReplacement(deck, 2);
      const p1 = this.sampleWithoutReplacement(deck, 2);
      const dealt = [p0, p1];

      if (scheme === "external") {
        for (let player = 0; player < 2; player++) {
          this.externalSamplingCFR(gameTree.root, player, dealt);
        }
      } else {
        const probs = [1, 1];
        this.outcomeSamplingCFR(
          gameTree.root,
          dealt,
          probs,
          Math.random() < 0.5 ? 0 : 1
        );
      }
    }
    return this.getAverageStrategies();
  }

  private externalSamplingCFR(
    node: TreeNode,
    player: number,
    dealt: Card[][]
  ): number {
    if (node.isTerminal) return this.evaluateTerminal(node, dealt);

    const cfrNode = this.getOrCreateNode(node);
    if (node.player === player) {
      const strategy = this.getStrategy(cfrNode);
      const utilities = new Map<Action, number>();
      let nodeUtil = 0;
      for (const [a, child] of node.children) {
        const u = this.externalSamplingCFR(child, player, dealt);
        utilities.set(a, u);
        nodeUtil += (strategy.get(a) || 0) * u;
      }
      for (const [a, u] of utilities) {
        const regret = u - nodeUtil;
        const current = cfrNode.regretSum.get(a) || 0;
        cfrNode.regretSum.set(a, current + regret);
      }
      return nodeUtil;
    } else {
      const strategy = this.getStrategy(cfrNode);
      const a = this.sampleAction(strategy);
      const child = node.children.get(a)!;
      return this.externalSamplingCFR(child, player, dealt);
    }
  }

  private outcomeSamplingCFR(
    node: TreeNode,
    dealt: Card[][],
    reachProbs: number[],
    player: number
  ): number {
    if (node.isTerminal) return this.evaluateTerminal(node, dealt);

    const cfrNode = this.getOrCreateNode(node);
    const strategy = this.getStrategy(cfrNode);
    const a = this.sampleAction(strategy);
    const actionProb = strategy.get(a) || 0;
    const newReach = [...reachProbs];
    if (node.player >= 0) newReach[node.player] *= actionProb;

    const child = node.children.get(a)!;
    const util = this.outcomeSamplingCFR(child, dealt, newReach, player);

    if (node.player === player) {
      const W = util * reachProbs[1 - player];
      for (const act of node.children.keys()) {
        const regret = act === a ? W * (1 - actionProb) : -W * actionProb;
        const current = cfrNode.regretSum.get(act) || 0;
        cfrNode.regretSum.set(act, current + regret);
      }
    }
    return util;
  }

  private getOrCreateNode(treeNode: TreeNode): CFRNode {
    let node = this.nodes.get(treeNode.infoSet);
    if (!node) {
      node = this.createNode(treeNode);
      this.nodes.set(treeNode.infoSet, node);
    }
    return node;
  }

  private sampleAction(strategy: Map<Action, number>): Action {
    const r = Math.random();
    let cumProb = 0;
    let last: Action | null = null;
    for (const [a, prob] of strategy) {
      cumProb += prob;
      if (r < cumProb) return a;
      last = a;
    }
    if (last && cumProb > 0.999999) return last;
    throw new Error(`Invalid strategy distribution: sum=${cumProb}`);
  }

  // --- Full deck + helpers ---
  private fullDeck(): Card[] {
    const ranks = [
      "A",
      "K",
      "Q",
      "J",
      "T",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ];
    const suits = ["♠", "♥", "♦", "♣"];
    const deck: Card[] = [];
    for (const r of ranks) {
      for (const s of suits) deck.push((r + s) as Card);
    }
    return deck;
  }

  private shuffleInPlace(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  private freshShuffledDeck(): Card[] {
    const deck = this.fullDeck();
    this.shuffleInPlace(deck);
    return deck;
  }

  private sampleWithoutReplacement(deck: Card[], n: number): Card[] {
    if (n > deck.length) throw new Error("Not enough cards");
    const picked: Card[] = [];
    for (let i = 0; i < n; i++) {
      const j = Math.floor(Math.random() * deck.length);
      picked.push(deck[j]);
      deck.splice(j, 1);
    }
    return picked;
  }

  private evaluateTerminal(node: TreeNode, dealt: Card[][]): number {
    return node.utility?.[0] || 0; // TODO: plug real evaluator
  }
}

/**
 * CFR+ with nonnegative regrets
 */
export class CFRPlus extends CFRSolver {
  protected updateRegrets(
    node: CFRNode,
    action: Action,
    regret: number,
    t: number
  ): void {
    const current = node.regretSum.get(action) || 0;
    const discount = Math.pow(t / (t + 1), 1.5);
    const newRegret = Math.max(0, current * discount + regret);
    node.regretSum.set(action, newRegret);
  }
}

// Export solvers
export const cfrSolver = new CFRSolver();
export const mccfrSolver = new MonteCarloCFR();
export const cfrPlusSolver = new CFRPlus();
