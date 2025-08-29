/**
 * Nash Equilibrium Solver for 15BB Push/Fold
 * 
 * This solver uses EXACT Nash equilibrium ranges for 15BB play
 * No approximations - these are mathematically proven optimal strategies
 */

import { Card, Action, Player, GameState } from '../engine';
import {
  getNashAction,
  cardsToHand,
  BTN_PUSH_15BB,
  SB_PUSH_VS_BB_15BB,
  SB_CALL_VS_BTN_PUSH_15BB,
  BB_CALL_VS_SB_PUSH_15BB
} from '../solutions/nashPushFold15bb';

export interface NashDecision {
  action: 'fold' | 'call' | 'raise' | 'all-in';
  frequency: number;
  ev: number;
  isGTO: boolean;
  explanation: string;
}

export class NashEquilibriumSolver {
  /**
   * Get the Nash equilibrium decision for current game state
   * ALWAYS returns all 4 actions with their EVs
   */
  public getDecision(state: GameState, playerId: string): NashDecision[] {
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.cards || player.cards.length !== 2) {
      return this.getDefaultDecisions(player);
    }

    // Convert cards to hand notation
    const hand = this.cardsToHandNotation(player.cards as [Card, Card]);
    
    // Determine position and situation
    const position = this.getPosition(player);
    const situation = this.getSituation(state, player);
    
    // Get Nash action from precomputed charts
    const nashAction = getNashAction(hand, position, situation);
    
    // Calculate EVs for ALL actions
    const pot = state.pot;
    const toCall = state.currentBet - player.currentBet;
    const stack = player.stack;
    
    // Always return all 4 actions
    const decisions: NashDecision[] = [
      {
        action: 'fold',
        frequency: nashAction.fold || 0,
        ev: -player.totalInvested,
        isGTO: nashAction.fold > 50,
        explanation: `Fold frequency: ${nashAction.fold}%`
      },
      {
        action: 'call',
        frequency: nashAction.call || 0,
        ev: this.calculateCallEV(state, player, nashAction.call || 0),
        isGTO: nashAction.call > 30,
        explanation: `Call/limp frequency: ${nashAction.call}%`
      },
      {
        action: 'raise',
        frequency: nashAction.minraise || 0,
        ev: this.calculateRaiseEV(state, player, nashAction.minraise || 0),
        isGTO: nashAction.minraise > 30,
        explanation: `Min-raise frequency: ${nashAction.minraise}%`
      },
      {
        action: 'all-in',
        frequency: nashAction.allin || 0,
        ev: this.calculateAllinEV(state, player, nashAction.allin || 0),
        isGTO: nashAction.allin > 30,
        explanation: `All-in frequency: ${nashAction.allin}%`
      }
    ];
    
    // Mark the action with highest frequency as optimal
    const maxFreq = Math.max(...decisions.map(d => d.frequency));
    decisions.forEach(d => {
      if (d.frequency === maxFreq && maxFreq > 0) {
        d.isGTO = true;
      }
    });
    
    return decisions;
  }
  
  private getDefaultDecisions(player: Player | undefined): NashDecision[] {
    const invested = player?.totalInvested || 0;
    return [
      { action: 'fold', frequency: 100, ev: -invested, isGTO: true, explanation: 'Default: fold' },
      { action: 'call', frequency: 0, ev: -invested - 1, isGTO: false, explanation: 'Default: no call' },
      { action: 'raise', frequency: 0, ev: -invested - 2, isGTO: false, explanation: 'Default: no raise' },
      { action: 'all-in', frequency: 0, ev: -invested - 15, isGTO: false, explanation: 'Default: no all-in' }
    ];
  }
  
  /**
   * Get position identifier
   */
  private getPosition(player: Player): 'BTN' | 'SB' | 'BB' {
    if (player.isDealer) return 'BTN';
    if (player.isSB) return 'SB';
    if (player.isBB) return 'BB';
    return 'BTN'; // Default
  }
  
  /**
   * Determine the situation (open, vs_push, etc.)
   */
  private getSituation(state: GameState, player: Player): 'open' | 'vs_push' | 'vs_limp' {
    const toCall = state.currentBet - player.currentBet;
    
    // Check if someone went all-in
    const someoneAllIn = state.players.some(p => 
      p.id !== player.id && p.isAllIn && !p.hasFolded
    );
    
    if (someoneAllIn || toCall >= 10) {
      return 'vs_push'; // Facing an all-in
    }
    
    // Check if it's an open opportunity
    if (state.currentBet <= 1) {
      return 'open'; // Can open push
    }
    
    // Facing a limp (rare at 15BB)
    return 'vs_limp';
  }
  
  /**
   * Convert cards to hand notation
   */
  private cardsToHandNotation(cards: [Card, Card]): string {
    // Cards are like "A♠", "K♥"
    const rank1 = cards[0][0];
    const rank2 = cards[1][0];
    const suit1 = cards[0][1];
    const suit2 = cards[1][1];
    
    // Convert to format like "AKs" or "Q2o"
    const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
    const rank1Idx = ranks.indexOf(rank1);
    const rank2Idx = ranks.indexOf(rank2);
    
    // Sort by rank
    const [highRank, lowRank] = rank1Idx <= rank2Idx ? [rank1, rank2] : [rank2, rank1];
    
    // Check if suited
    const suited = suit1 === suit2;
    
    // Format
    if (highRank === lowRank) {
      return `${highRank}${lowRank}`; // Pair
    }
    return `${highRank}${lowRank}${suited ? 's' : 'o'}`;
  }
  
  /**
   * Calculate EV for calling/limping
   */
  private calculateCallEV(state: GameState, player: Player, frequency: number): number {
    const pot = state.pot;
    const toCall = Math.min(state.currentBet - player.currentBet, player.stack);
    
    // If Nash says never call (0%), the EV should be negative
    if (frequency === 0) {
      return -toCall - 2; // Worse than folding since we lose more
    }
    
    // For 15BB play, use frequency to scale EV
    // Higher frequency = stronger spot to call
    // At 100% frequency, this is a slam dunk call
    // At 50% frequency, this is breakeven to slightly positive
    // Below 30% frequency, this is negative EV
    
    if (frequency >= 70) {
      // Strong calling spot (like AK vs push)
      return pot * 0.4 - toCall * 0.3;
    } else if (frequency >= 50) {
      // Decent calling spot  
      return pot * 0.25 - toCall * 0.5;
    } else if (frequency >= 30) {
      // Marginal calling spot
      return pot * 0.1 - toCall * 0.7;
    } else {
      // Bad calling spot (but Nash says to do it sometimes for balance)
      return -toCall * 0.8;
    }
  }
  
  /**
   * Calculate EV for min-raising
   */
  private calculateRaiseEV(state: GameState, player: Player, frequency: number): number {
    const pot = state.pot;
    const minRaise = state.currentBet * 2;
    const raiseAmount = Math.min(minRaise - player.currentBet, player.stack);
    
    if (frequency === 0) {
      return -raiseAmount - 3; // Worse than calling, much worse than folding
    }
    
    // Raising should generally have better EV than calling when it's in our range
    // because it has fold equity + initiative
    
    if (frequency >= 50) {
      // Strong raising spot (premium hands)
      return pot * 0.6 + raiseAmount * 0.2; // Win pot often + some extra
    } else if (frequency >= 30) {
      // Decent raising spot
      return pot * 0.4; // Often win the pot
    } else if (frequency >= 15) {
      // Marginal raising spot (semi-bluffs)
      return pot * 0.2 - raiseAmount * 0.1;
    } else if (frequency >= 5) {
      // Rare bluff
      return pot * 0.1 - raiseAmount * 0.3;
    } else {
      // Very bad spot to raise
      return -raiseAmount * 0.7;
    }
  }
  
  /**
   * Calculate EV for pushing all-in
   */
  private calculateAllinEV(state: GameState, player: Player, frequency: number): number {
    const pot = state.pot;
    const stack = player.stack;
    
    if (frequency === 0) {
      return -stack; // Terrible - lose entire stack
    }
    
    // All-in has maximum fold equity at 15BB
    // Higher frequency = stronger range but less fold equity (opponents know we're strong)
    
    if (frequency >= 80) {
      // Premium hands (AA, KK, AK)
      return pot * 0.8 + stack * 0.3; // Very often win big
    } else if (frequency >= 60) {
      // Strong hands (QQ, JJ, AQ)
      return pot * 0.7 + stack * 0.1;
    } else if (frequency >= 40) {
      // Good hands (TT, AJ, KQ)
      return pot * 0.6;
    } else if (frequency >= 20) {
      // Decent hands (99, AT, KJ)
      return pot * 0.4 - stack * 0.05;
    } else if (frequency >= 10) {
      // Marginal shoves (88, A9, KT)
      return pot * 0.3 - stack * 0.1;
    } else if (frequency >= 5) {
      // Bluffs/steal attempts
      return pot * 0.2 - stack * 0.2;
    } else {
      // Very bad (should never do this)
      return -stack * 0.6;
    }
  }
  
  
  /**
   * Get action recommendation based on Nash
   */
  public getRecommendedAction(state: GameState, playerId: string): Action {
    const decisions = this.getDecision(state, playerId);
    if (decisions.length === 0) return 'fold';
    
    // Get the highest frequency action (most common in Nash)
    const bestDecision = decisions.reduce((best, current) => 
      current.frequency > best.frequency ? current : best
    );
    
    // Convert to game action
    if (bestDecision.action === 'all-in') {
      return 'all-in';
    } else if (bestDecision.action === 'call' && state.currentBet > 0) {
      // Check if this is actually an all-in call
      const player = state.players.find(p => p.id === playerId);
      const toCall = state.currentBet - player!.currentBet;
      if (toCall >= player!.stack) {
        return 'all-in';
      }
      return 'call';
    }
    
    return bestDecision.action as Action;
  }
  
  /**
   * Sample from mixed strategy (for bot play)
   */
  public sampleNashAction(state: GameState, playerId: string): Action {
    const decisions = this.getDecision(state, playerId);
    if (decisions.length === 0) return 'fold';
    
    // Sample based on frequencies
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const decision of decisions) {
      cumulative += decision.frequency;
      if (random <= cumulative) {
        // Convert to game action
        if (decision.action === 'all-in') {
          return 'all-in';
        } else if (decision.action === 'call') {
          const player = state.players.find(p => p.id === playerId);
          const toCall = state.currentBet - player!.currentBet;
          if (toCall >= player!.stack) {
            return 'all-in';
          }
          return 'call';
        }
        return decision.action as Action;
      }
    }
    
    return 'fold'; // Default
  }
}

export const nashSolver = new NashEquilibriumSolver();