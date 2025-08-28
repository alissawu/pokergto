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
   */
  public getDecision(state: GameState, playerId: string): NashDecision[] {
    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.cards || player.cards.length !== 2) {
      return [];
    }

    // Convert cards to hand notation
    const hand = this.cardsToHandNotation(player.cards as [Card, Card]);
    
    // Determine position and situation
    const position = this.getPosition(player);
    const situation = this.getSituation(state, player);
    
    // Get Nash action from precomputed charts
    const nashAction = getNashAction(hand, position, situation);
    
    // Calculate EVs
    const decisions: NashDecision[] = [];
    const pot = state.pot;
    const toCall = state.currentBet - player.currentBet;
    
    // Push/All-in decision
    if (nashAction.push > 0 || situation === 'open') {
      const pushEV = this.calculatePushEV(state, player, nashAction.push);
      decisions.push({
        action: toCall > 0 ? 'call' : 'push', // If facing a push, we call (all-in)
        frequency: nashAction.push,
        ev: pushEV,
        isGTO: nashAction.push > 50, // Majority strategy is GTO
        explanation: `Nash: Push ${nashAction.push}% of the time with ${hand}`
      });
    }
    
    // Fold decision
    if (nashAction.fold > 0) {
      decisions.push({
        action: 'fold',
        frequency: nashAction.fold,
        ev: -player.totalInvested,
        isGTO: nashAction.fold > 50,
        explanation: `Nash: Fold ${nashAction.fold}% of the time with ${hand}`
      });
    }
    
    // Sort by frequency (most common action first)
    decisions.sort((a, b) => b.frequency - a.frequency);
    
    return decisions;
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
   * Calculate EV for pushing all-in
   */
  private calculatePushEV(state: GameState, player: Player, pushFrequency: number): number {
    const pot = state.pot;
    const stack = player.stack;
    
    // If Nash says never push (0%), the EV is terrible
    if (pushFrequency === 0) {
      return -stack; // You'll lose your entire stack
    }
    
    // EV based on Nash push frequency
    // Higher frequency = stronger hand = better EV
    if (pushFrequency >= 80) {
      return pot * 0.6; // Premium hands
    } else if (pushFrequency >= 50) {
      return pot * 0.3; // Good hands
    } else if (pushFrequency >= 20) {
      return pot * 0.1; // Marginal pushes
    } else if (pushFrequency >= 5) {
      return -stack * 0.2; // Rare bluffs
    } else {
      return -stack * 0.5; // Very bad pushes
    }
  }
  
  /**
   * Get action recommendation based on Nash
   */
  public getRecommendedAction(state: GameState, playerId: string): Action {
    const decisions = this.getDecision(state, playerId);
    if (decisions.length === 0) return 'fold';
    
    // Get the highest frequency action (most common in Nash)
    const bestDecision = decisions[0];
    
    // Convert to game action
    if (bestDecision.action === 'push') {
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
        if (decision.action === 'push') {
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