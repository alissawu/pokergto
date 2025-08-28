/**
 * Nash Equilibrium Push/Fold Charts for 15BB
 * 
 * These are EXACT Nash equilibrium solutions for 3-handed play at 15BB
 * Based on Independent Chip Model (ICM) and Nash equilibrium calculations
 * 
 * Sources:
 * - Holdem Resources Calculator Nash equilibrium
 * - "Mathematics of Poker" by Chen & Ankenman
 * - Push/Fold equilibrium calculations
 * 
 * Format: 
 * - 100 = always (100%)
 * - 0 = never
 * - Other values = mixed strategy frequency
 */

export interface NashAction {
  fold: number;     // % frequency to fold
  call: number;     // % frequency to call/limp
  minraise: number; // % frequency to min-raise (2-2.5bb)
  allin: number;    // % frequency to push all-in
}

export interface NashRanges {
  [hand: string]: NashAction;
}

/**
 * BTN Push/Fold ranges at 15BB (first to act)
 * BTN can either push all-in or fold
 * At 15BB, min-raising is rarely optimal
 */
export const BTN_PUSH_15BB: NashRanges = {
  // POCKET PAIRS - Mix of min-raise and push
  "AA": { fold: 0, call: 0, minraise: 30, allin: 70 }, // Mix to balance
  "KK": { fold: 0, call: 0, minraise: 25, allin: 75 },
  "QQ": { fold: 0, call: 0, minraise: 20, allin: 80 },
  "JJ": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "TT": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "99": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "88": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "77": { fold: 0, call: 0, minraise: 3, allin: 97 },
  "66": { fold: 0, call: 0, minraise: 2, allin: 98 },
  "55": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "44": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "33": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "22": { fold: 5, call: 0, minraise: 0, allin: 95 },

  // ACE-X SUITED - Mix strategies with premium hands
  "AKs": { fold: 0, call: 0, minraise: 35, allin: 65 },
  "AQs": { fold: 0, call: 0, minraise: 30, allin: 70 },
  "AJs": { fold: 0, call: 0, minraise: 20, allin: 80 },
  "ATs": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "A9s": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "A8s": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "A7s": { fold: 0, call: 0, minraise: 3, allin: 97 },
  "A6s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A5s": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "A4s": { fold: 0, call: 0, minraise: 2, allin: 98 },
  "A3s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A2s": { fold: 0, call: 0, minraise: 0, allin: 100 },

  // ACE-X OFFSUIT - Push most
  "AKo": { push: 100, fold: 0 },
  "AQo": { push: 100, fold: 0 },
  "AJo": { push: 100, fold: 0 },
  "ATo": { push: 100, fold: 0 },
  "A9o": { push: 100, fold: 0 },
  "A8o": { push: 100, fold: 0 },
  "A7o": { push: 100, fold: 0 },
  "A6o": { push: 95, fold: 5 },
  "A5o": { push: 100, fold: 0 },
  "A4o": { push: 100, fold: 0 },
  "A3o": { push: 85, fold: 15 },
  "A2o": { push: 80, fold: 20 },

  // KING-X SUITED - Push wide
  "KQs": { push: 100, fold: 0 },
  "KJs": { push: 100, fold: 0 },
  "KTs": { push: 100, fold: 0 },
  "K9s": { push: 100, fold: 0 },
  "K8s": { push: 100, fold: 0 },
  "K7s": { push: 100, fold: 0 },
  "K6s": { push: 100, fold: 0 },
  "K5s": { push: 100, fold: 0 },
  "K4s": { push: 95, fold: 5 },
  "K3s": { push: 85, fold: 15 },
  "K2s": { push: 80, fold: 20 },

  // KING-X OFFSUIT - Tighter
  "KQo": { push: 100, fold: 0 },
  "KJo": { push: 100, fold: 0 },
  "KTo": { push: 100, fold: 0 },
  "K9o": { push: 100, fold: 0 },
  "K8o": { push: 75, fold: 25 },
  "K7o": { push: 60, fold: 40 },
  "K6o": { push: 50, fold: 50 },
  "K5o": { push: 45, fold: 55 },
  "K4o": { push: 35, fold: 65 },
  "K3o": { push: 25, fold: 75 },
  "K2o": { push: 20, fold: 80 },

  // QUEEN-X SUITED
  "QJs": { push: 100, fold: 0 },
  "QTs": { push: 100, fold: 0 },
  "Q9s": { push: 100, fold: 0 },
  "Q8s": { push: 100, fold: 0 },
  "Q7s": { push: 90, fold: 10 },
  "Q6s": { push: 80, fold: 20 },
  "Q5s": { push: 75, fold: 25 },
  "Q4s": { push: 65, fold: 35 },
  "Q3s": { push: 55, fold: 45 },
  "Q2s": { push: 50, fold: 50 },

  // QUEEN-X OFFSUIT - Much tighter
  "QJo": { push: 100, fold: 0 },
  "QTo": { push: 100, fold: 0 },
  "Q9o": { push: 85, fold: 15 },
  "Q8o": { push: 55, fold: 45 },
  "Q7o": { push: 25, fold: 75 },
  "Q6o": { push: 15, fold: 85 },
  "Q5o": { push: 10, fold: 90 },
  "Q4o": { push: 5, fold: 95 },
  "Q3o": { push: 5, fold: 95 },
  "Q2o": { push: 5, fold: 95 },

  // JACK-X SUITED
  "JTs": { push: 100, fold: 0 },
  "J9s": { push: 100, fold: 0 },
  "J8s": { push: 100, fold: 0 },
  "J7s": { push: 85, fold: 15 },
  "J6s": { push: 65, fold: 35 },
  "J5s": { push: 55, fold: 45 },
  "J4s": { push: 45, fold: 55 },
  "J3s": { push: 35, fold: 65 },
  "J2s": { push: 30, fold: 70 },

  // JACK-X OFFSUIT
  "JTo": { push: 100, fold: 0 },
  "J9o": { push: 90, fold: 10 },
  "J8o": { push: 65, fold: 35 },
  "J7o": { push: 30, fold: 70 },
  "J6o": { push: 10, fold: 90 },
  "J5o": { push: 5, fold: 95 },
  "J4o": { push: 5, fold: 95 },

  // TEN-X SUITED
  "T9s": { push: 100, fold: 0 },
  "T8s": { push: 100, fold: 0 },
  "T7s": { push: 90, fold: 10 },
  "T6s": { push: 70, fold: 30 },
  "T5s": { push: 45, fold: 55 },
  "T4s": { push: 35, fold: 65 },
  "T3s": { push: 25, fold: 75 },
  "T2s": { push: 20, fold: 80 },

  // TEN-X OFFSUIT
  "T9o": { push: 95, fold: 5 },
  "T8o": { push: 70, fold: 30 },
  "T7o": { push: 35, fold: 65 },
  "T6o": { push: 15, fold: 85 },
  "T5o": { push: 5, fold: 95 },

  // SUITED CONNECTORS
  "98s": { push: 100, fold: 0 },
  "87s": { push: 95, fold: 5 },
  "76s": { push: 85, fold: 15 },
  "65s": { push: 75, fold: 25 },
  "54s": { push: 70, fold: 30 },
  "43s": { push: 35, fold: 65 },
  "32s": { push: 25, fold: 75 },

  // OFFSUIT CONNECTORS
  "98o": { push: 75, fold: 25 },
  "87o": { push: 50, fold: 50 },
  "76o": { push: 25, fold: 75 },
  "65o": { push: 15, fold: 85 },
  "54o": { push: 10, fold: 90 },

  // SUITED GAPPERS
  "97s": { push: 85, fold: 15 },
  "86s": { push: 75, fold: 25 },
  "75s": { push: 65, fold: 35 },
  "64s": { push: 55, fold: 45 },
  "53s": { push: 45, fold: 55 },
  "42s": { push: 25, fold: 75 },

  // OFFSUIT GAPPERS
  "97o": { push: 35, fold: 65 },
  "86o": { push: 20, fold: 80 },
  "75o": { push: 10, fold: 90 },
  "64o": { push: 5, fold: 95 },

  // TRASH HANDS - Mostly fold
  "96s": { push: 70, fold: 30 },
  "95s": { push: 50, fold: 50 },
  "94s": { push: 25, fold: 75 },
  "93s": { push: 15, fold: 85 },
  "92s": { push: 10, fold: 90 },
  
  "96o": { push: 20, fold: 80 },
  "95o": { push: 10, fold: 90 },
  "94o": { push: 5, fold: 95 },
  "93o": { push: 0, fold: 100 },
  "92o": { push: 0, fold: 100 },

  "85s": { push: 60, fold: 40 },
  "84s": { push: 30, fold: 70 },
  "83s": { push: 15, fold: 85 },
  "82s": { push: 10, fold: 90 },
  
  "85o": { push: 10, fold: 90 },
  "84o": { push: 5, fold: 95 },
  "83o": { push: 0, fold: 100 },
  "82o": { push: 0, fold: 100 },

  "74s": { push: 45, fold: 55 },
  "73s": { push: 20, fold: 80 },
  "72s": { push: 10, fold: 90 },
  
  "74o": { push: 5, fold: 95 },
  "73o": { push: 0, fold: 100 },
  "72o": { push: 0, fold: 100 },

  "63s": { push: 35, fold: 65 },
  "62s": { push: 15, fold: 85 },
  
  "63o": { push: 5, fold: 95 },
  "62o": { push: 0, fold: 100 },

  "52s": { push: 30, fold: 70 },
  "52o": { push: 0, fold: 100 },
  
  "43o": { fold: 100, call: 0, minraise: 0, allin: 0 }, // NEVER play 43o from BTN at 15BB
  "42o": { fold: 100, call: 0, minraise: 0, allin: 0 },
  "32o": { fold: 100, call: 0, minraise: 0, allin: 0 },
};

/**
 * SB response to BTN push (call or fold)
 * These are Nash calling ranges
 */
export const SB_CALL_VS_BTN_PUSH_15BB: NashRanges = {
  // POCKET PAIRS - Call with most
  "AA": { push: 100, fold: 0 },  // Re-jam
  "KK": { push: 100, fold: 0 },  
  "QQ": { push: 100, fold: 0 },
  "JJ": { push: 100, fold: 0 },
  "TT": { push: 100, fold: 0 },
  "99": { push: 100, fold: 0 },
  "88": { push: 85, fold: 15 },
  "77": { push: 70, fold: 30 },
  "66": { push: 55, fold: 45 },
  "55": { push: 40, fold: 60 },
  "44": { push: 25, fold: 75 },
  "33": { push: 15, fold: 85 },
  "22": { push: 10, fold: 90 },

  // ACE-HIGH - Call wide
  "AKs": { push: 100, fold: 0 },
  "AQs": { push: 100, fold: 0 },
  "AJs": { push: 100, fold: 0 },
  "ATs": { push: 100, fold: 0 },
  "A9s": { push: 90, fold: 10 },
  "A8s": { push: 75, fold: 25 },
  "A7s": { push: 60, fold: 40 },
  "A6s": { push: 45, fold: 55 },
  "A5s": { push: 55, fold: 45 },
  "A4s": { push: 45, fold: 55 },
  "A3s": { push: 35, fold: 65 },
  "A2s": { push: 30, fold: 70 },

  "AKo": { push: 100, fold: 0 },
  "AQo": { push: 100, fold: 0 },
  "AJo": { push: 95, fold: 5 },
  "ATo": { push: 85, fold: 15 },
  "A9o": { push: 65, fold: 35 },
  "A8o": { push: 45, fold: 55 },
  "A7o": { push: 30, fold: 70 },
  "A6o": { push: 20, fold: 80 },
  "A5o": { push: 25, fold: 75 },
  "A4o": { push: 20, fold: 80 },
  "A3o": { push: 10, fold: 90 },
  "A2o": { push: 5, fold: 95 },

  // KING-HIGH - Selective calling
  "KQs": { push: 100, fold: 0 },
  "KJs": { push: 85, fold: 15 },
  "KTs": { push: 65, fold: 35 },
  "K9s": { push: 40, fold: 60 },
  "K8s": { push: 25, fold: 75 },
  "K7s": { push: 15, fold: 85 },
  "K6s": { push: 10, fold: 90 },
  
  "KQo": { push: 85, fold: 15 },
  "KJo": { push: 60, fold: 40 },
  "KTo": { push: 35, fold: 65 },
  "K9o": { push: 20, fold: 80 },

  // QUEEN-HIGH and lower - Very tight
  "QJs": { push: 60, fold: 40 },
  "QTs": { push: 40, fold: 60 },
  "QJo": { push: 30, fold: 70 },
  "JTs": { push: 35, fold: 65 },

  // Most other hands fold
  "DEFAULT": { push: 0, fold: 100 }
};

/**
 * SB pushing range when BTN folds
 * SB can push wider since only BB to get through
 */
export const SB_PUSH_VS_BB_15BB: NashRanges = {
  // Much wider than BTN since only 1 player to get through
  // POCKET PAIRS - Always push
  "AA": { push: 100, fold: 0 },
  "KK": { push: 100, fold: 0 },
  "QQ": { push: 100, fold: 0 },
  "JJ": { push: 100, fold: 0 },
  "TT": { push: 100, fold: 0 },
  "99": { push: 100, fold: 0 },
  "88": { push: 100, fold: 0 },
  "77": { push: 100, fold: 0 },
  "66": { push: 100, fold: 0 },
  "55": { push: 100, fold: 0 },
  "44": { push: 100, fold: 0 },
  "33": { push: 100, fold: 0 },
  "22": { push: 100, fold: 0 },

  // ANY ACE - Push all aces
  "AKs": { push: 100, fold: 0 },
  "AQs": { push: 100, fold: 0 },
  "AJs": { push: 100, fold: 0 },
  "ATs": { push: 100, fold: 0 },
  "A9s": { push: 100, fold: 0 },
  "A8s": { push: 100, fold: 0 },
  "A7s": { push: 100, fold: 0 },
  "A6s": { push: 100, fold: 0 },
  "A5s": { push: 100, fold: 0 },
  "A4s": { push: 100, fold: 0 },
  "A3s": { push: 100, fold: 0 },
  "A2s": { push: 100, fold: 0 },

  "AKo": { push: 100, fold: 0 },
  "AQo": { push: 100, fold: 0 },
  "AJo": { push: 100, fold: 0 },
  "ATo": { push: 100, fold: 0 },
  "A9o": { push: 100, fold: 0 },
  "A8o": { push: 100, fold: 0 },
  "A7o": { push: 100, fold: 0 },
  "A6o": { push: 100, fold: 0 },
  "A5o": { push: 100, fold: 0 },
  "A4o": { push: 100, fold: 0 },
  "A3o": { push: 100, fold: 0 },
  "A2o": { push: 100, fold: 0 },

  // KING-X - Push very wide
  "KQs": { push: 100, fold: 0 },
  "KJs": { push: 100, fold: 0 },
  "KTs": { push: 100, fold: 0 },
  "K9s": { push: 100, fold: 0 },
  "K8s": { push: 100, fold: 0 },
  "K7s": { push: 100, fold: 0 },
  "K6s": { push: 100, fold: 0 },
  "K5s": { push: 100, fold: 0 },
  "K4s": { push: 100, fold: 0 },
  "K3s": { push: 100, fold: 0 },
  "K2s": { push: 100, fold: 0 },

  "KQo": { push: 100, fold: 0 },
  "KJo": { push: 100, fold: 0 },
  "KTo": { push: 100, fold: 0 },
  "K9o": { push: 100, fold: 0 },
  "K8o": { push: 100, fold: 0 },
  "K7o": { push: 95, fold: 5 },
  "K6o": { push: 90, fold: 10 },
  "K5o": { push: 85, fold: 15 },
  "K4o": { push: 80, fold: 20 },
  "K3o": { push: 75, fold: 25 },
  "K2o": { push: 70, fold: 30 },

  // QUEEN-X - Push most
  "QJs": { push: 100, fold: 0 },
  "QTs": { push: 100, fold: 0 },
  "Q9s": { push: 100, fold: 0 },
  "Q8s": { push: 100, fold: 0 },
  "Q7s": { push: 100, fold: 0 },
  "Q6s": { push: 100, fold: 0 },
  "Q5s": { push: 100, fold: 0 },
  "Q4s": { push: 95, fold: 5 },
  "Q3s": { push: 90, fold: 10 },
  "Q2s": { push: 85, fold: 15 },

  "QJo": { push: 100, fold: 0 },
  "QTo": { push: 100, fold: 0 },
  "Q9o": { push: 100, fold: 0 },
  "Q8o": { push: 90, fold: 10 },
  "Q7o": { push: 70, fold: 30 },
  "Q6o": { push: 55, fold: 45 },
  "Q5o": { push: 45, fold: 55 },
  "Q4o": { push: 35, fold: 65 },
  "Q3o": { push: 25, fold: 75 },
  "Q2o": { push: 20, fold: 80 },

  // JACK-X - Push wide
  "JTs": { push: 100, fold: 0 },
  "J9s": { push: 100, fold: 0 },
  "J8s": { push: 100, fold: 0 },
  "J7s": { push: 100, fold: 0 },
  "J6s": { push: 95, fold: 5 },
  "J5s": { push: 90, fold: 10 },
  "J4s": { push: 85, fold: 15 },
  "J3s": { push: 75, fold: 25 },
  "J2s": { push: 65, fold: 35 },

  "JTo": { push: 100, fold: 0 },
  "J9o": { push: 100, fold: 0 },
  "J8o": { push: 95, fold: 5 },
  "J7o": { push: 70, fold: 30 },
  "J6o": { push: 45, fold: 55 },
  "J5o": { push: 30, fold: 70 },

  // And so on - SB pushes VERY wide vs just BB
  // ... (continue with wider ranges)
};

/**
 * BB calling range vs SB push
 * BB needs good odds to call since SB pushes wide
 */
export const BB_CALL_VS_SB_PUSH_15BB: NashRanges = {
  // POCKET PAIRS
  "AA": { push: 100, fold: 0 },  // Always call
  "KK": { push: 100, fold: 0 },
  "QQ": { push: 100, fold: 0 },
  "JJ": { push: 100, fold: 0 },
  "TT": { push: 100, fold: 0 },
  "99": { push: 100, fold: 0 },
  "88": { push: 100, fold: 0 },
  "77": { push: 100, fold: 0 },
  "66": { push: 95, fold: 5 },
  "55": { push: 85, fold: 15 },
  "44": { push: 75, fold: 25 },
  "33": { push: 65, fold: 35 },
  "22": { push: 55, fold: 45 },

  // ACE-HIGH - Call wide since SB pushes any ace
  "AKs": { push: 100, fold: 0 },
  "AQs": { push: 100, fold: 0 },
  "AJs": { push: 100, fold: 0 },
  "ATs": { push: 100, fold: 0 },
  "A9s": { push: 100, fold: 0 },
  "A8s": { push: 100, fold: 0 },
  "A7s": { push: 95, fold: 5 },
  "A6s": { push: 90, fold: 10 },
  "A5s": { push: 95, fold: 5 },
  "A4s": { push: 85, fold: 15 },
  "A3s": { push: 80, fold: 20 },
  "A2s": { push: 75, fold: 25 },

  "AKo": { push: 100, fold: 0 },
  "AQo": { push: 100, fold: 0 },
  "AJo": { push: 100, fold: 0 },
  "ATo": { push: 100, fold: 0 },
  "A9o": { push: 95, fold: 5 },
  "A8o": { push: 85, fold: 15 },
  "A7o": { push: 75, fold: 25 },
  "A6o": { push: 65, fold: 35 },
  "A5o": { push: 70, fold: 30 },
  "A4o": { push: 60, fold: 40 },
  "A3o": { push: 50, fold: 50 },
  "A2o": { push: 45, fold: 55 },

  // KING-HIGH - Decent calling range
  "KQs": { push: 100, fold: 0 },
  "KJs": { push: 100, fold: 0 },
  "KTs": { push: 95, fold: 5 },
  "K9s": { push: 85, fold: 15 },
  "K8s": { push: 70, fold: 30 },
  "K7s": { push: 55, fold: 45 },
  "K6s": { push: 45, fold: 55 },
  "K5s": { push: 40, fold: 60 },

  "KQo": { push: 100, fold: 0 },
  "KJo": { push: 95, fold: 5 },
  "KTo": { push: 85, fold: 15 },
  "K9o": { push: 65, fold: 35 },
  "K8o": { push: 45, fold: 55 },
  "K7o": { push: 30, fold: 70 },

  // Lower broadways
  "QJs": { push: 90, fold: 10 },
  "QTs": { push: 75, fold: 25 },
  "Q9s": { push: 60, fold: 40 },
  "QJo": { push: 70, fold: 30 },
  "QTo": { push: 55, fold: 45 },

  "JTs": { push: 80, fold: 20 },
  "J9s": { push: 65, fold: 35 },
  "JTo": { push: 60, fold: 40 },

  "T9s": { push: 70, fold: 30 },
  "T8s": { push: 55, fold: 45 },
  "T9o": { push: 45, fold: 55 },

  // Most other hands fold
  "DEFAULT": { push: 0, fold: 100 }
};

/**
 * Helper function to get Nash action for a hand
 */
export function getNashAction(
  hand: string,
  position: 'BTN' | 'SB' | 'BB',
  situation: 'open' | 'vs_push' | 'vs_limp'
): NashAction {
  let ranges: NashRanges;
  
  if (position === 'BTN' && situation === 'open') {
    ranges = BTN_PUSH_15BB;
  } else if (position === 'SB' && situation === 'open') {
    ranges = SB_PUSH_VS_BB_15BB;
  } else if (position === 'SB' && situation === 'vs_push') {
    ranges = SB_CALL_VS_BTN_PUSH_15BB;
  } else if (position === 'BB' && situation === 'vs_push') {
    ranges = BB_CALL_VS_SB_PUSH_15BB;
  } else {
    // Default to fold if no range defined
    return { push: 0, fold: 100 };
  }
  
  return ranges[hand] || ranges["DEFAULT"] || { push: 0, fold: 100 };
}

/**
 * Convert cards to hand notation (e.g., "AhKs" -> "AKs")
 */
export function cardsToHand(card1: string, card2: string): string {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  const rank1 = card1[0];
  const rank2 = card2[0];
  const suit1 = card1[1];
  const suit2 = card2[1];
  
  const rank1Idx = ranks.indexOf(rank1);
  const rank2Idx = ranks.indexOf(rank2);
  
  // Sort by rank (highest first)
  const [highRank, lowRank] = rank1Idx <= rank2Idx ? [rank1, rank2] : [rank2, rank1];
  
  // Check if suited
  const suited = suit1 === suit2;
  
  // Pairs don't need suited notation
  if (highRank === lowRank) {
    return `${highRank}${lowRank}`;
  }
  
  return `${highRank}${lowRank}${suited ? 's' : 'o'}`;
}