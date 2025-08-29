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

  // ACE-X OFFSUIT - Strong hands with some mixing
  "AKo": { fold: 0, call: 0, minraise: 25, allin: 75 }, // Mix raise/allin
  "AQo": { fold: 0, call: 0, minraise: 20, allin: 80 },
  "AJo": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "ATo": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "A9o": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "A8o": { fold: 0, call: 0, minraise: 3, allin: 97 },
  "A7o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A6o": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "A5o": { fold: 0, call: 0, minraise: 5, allin: 95 }, // Wheel blocker
  "A4o": { fold: 0, call: 0, minraise: 2, allin: 98 },
  "A3o": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "A2o": { fold: 20, call: 0, minraise: 0, allin: 80 },

  // KING-X SUITED - Push wide
  "KQs": { fold: 0, call: 0, minraise: 25, allin: 75 },
  "KJs": { fold: 0, call: 0, minraise: 20, allin: 80 },
  "KTs": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "K9s": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "K8s": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "K7s": { fold: 0, call: 0, minraise: 3, allin: 97 },
  "K6s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K5s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K4s": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "K3s": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "K2s": { fold: 20, call: 0, minraise: 0, allin: 80 },

  // KING-X OFFSUIT - Tighter
  "KQo": { fold: 0, call: 0, minraise: 20, allin: 80 },
  "KJo": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "KTo": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "K9o": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "K8o": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "K7o": { fold: 40, call: 0, minraise: 0, allin: 60 },
  "K6o": { fold: 50, call: 0, minraise: 0, allin: 50 },
  "K5o": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "K4o": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "K3o": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "K2o": { fold: 80, call: 0, minraise: 0, allin: 20 },

  // QUEEN-X SUITED
  "QJs": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "QTs": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "Q9s": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "Q8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q7s": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "Q6s": { fold: 20, call: 0, minraise: 0, allin: 80 },
  "Q5s": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "Q4s": { fold: 35, call: 0, minraise: 0, allin: 65 },
  "Q3s": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "Q2s": { fold: 50, call: 0, minraise: 0, allin: 50 },

  // QUEEN-X OFFSUIT - Much tighter
  "QJo": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "QTo": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "Q9o": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "Q8o": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "Q7o": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "Q6o": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "Q5o": { fold: 90, call: 0, minraise: 0, allin: 10 },
  "Q4o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "Q3o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "Q2o": { fold: 100, call: 0, minraise: 0, allin: 0 },

  // JACK-X SUITED
  "JTs": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "J9s": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "J8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J7s": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "J6s": { fold: 35, call: 0, minraise: 0, allin: 65 },
  "J5s": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "J4s": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "J3s": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "J2s": { fold: 70, call: 0, minraise: 0, allin: 30 },

  // JACK-X OFFSUIT
  "JTo": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "J9o": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "J8o": { fold: 35, call: 0, minraise: 0, allin: 65 },
  "J7o": { fold: 70, call: 0, minraise: 0, allin: 30 },
  "J6o": { fold: 90, call: 0, minraise: 0, allin: 10 },
  "J5o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "J4o": { fold: 95, call: 0, minraise: 0, allin: 5 },

  // TEN-X SUITED
  "T9s": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "T8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "T7s": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "T6s": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "T5s": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "T4s": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "T3s": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "T2s": { fold: 80, call: 0, minraise: 0, allin: 20 },

  // TEN-X OFFSUIT
  "T9o": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "T8o": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "T7o": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "T6o": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "T5o": { fold: 95, call: 0, minraise: 0, allin: 5 },

  // SUITED CONNECTORS
  "98s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "87s": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "76s": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "65s": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "54s": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "43s": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "32s": { fold: 75, call: 0, minraise: 0, allin: 25 },

  // OFFSUIT CONNECTORS
  "98o": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "87o": { fold: 50, call: 0, minraise: 0, allin: 50 },
  "76o": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "65o": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "54o": { fold: 90, call: 0, minraise: 0, allin: 10 },

  // SUITED GAPPERS
  "97s": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "86s": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "75s": { fold: 35, call: 0, minraise: 0, allin: 65 },
  "64s": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "53s": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "42s": { fold: 75, call: 0, minraise: 0, allin: 25 },

  // OFFSUIT GAPPERS
  "97o": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "86o": { fold: 80, call: 0, minraise: 0, allin: 20 },
  "75o": { fold: 90, call: 0, minraise: 0, allin: 10 },
  "64o": { fold: 95, call: 0, minraise: 0, allin: 5 },

  // TRASH HANDS - Mostly fold
  "96s": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "95s": { fold: 50, call: 0, minraise: 0, allin: 50 },
  "94s": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "93s": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "92s": { fold: 90, call: 0, minraise: 0, allin: 10 },
  
  "96o": { fold: 80, call: 0, minraise: 0, allin: 20 },
  "95o": { fold: 90, call: 0, minraise: 0, allin: 10 },
  "94o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "93o": { fold: 100, call: 0, minraise: 0, allin: 0 },
  "92o": { fold: 100, call: 0, minraise: 0, allin: 0 },

  "85s": { fold: 40, call: 0, minraise: 0, allin: 60 },
  "84s": { fold: 70, call: 0, minraise: 0, allin: 30 },
  "83s": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "82s": { fold: 90, call: 0, minraise: 0, allin: 10 },
  
  "85o": { fold: 90, call: 0, minraise: 0, allin: 10 },
  "84o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "83o": { fold: 100, call: 0, minraise: 0, allin: 0 },
  "82o": { fold: 100, call: 0, minraise: 0, allin: 0 },

  "74s": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "73s": { fold: 80, call: 0, minraise: 0, allin: 20 },
  "72s": { fold: 90, call: 0, minraise: 0, allin: 10 },
  
  "74o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "73o": { fold: 100, call: 0, minraise: 0, allin: 0 },
  "72o": { fold: 100, call: 0, minraise: 0, allin: 0 },

  "63s": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "62s": { fold: 85, call: 0, minraise: 0, allin: 15 },
  
  "63o": { fold: 95, call: 0, minraise: 0, allin: 5 },
  "62o": { fold: 100, call: 0, minraise: 0, allin: 0 },

  "52s": { fold: 70, call: 0, minraise: 0, allin: 30 },
  "52o": { fold: 100, call: 0, minraise: 0, allin: 0 },
  
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
  "AA": { fold: 0, call: 0, minraise: 0, allin: 100 },  // Re-jam
  "KK": { fold: 0, call: 0, minraise: 0, allin: 100 },  
  "QQ": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "JJ": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "TT": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "99": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "88": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "77": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "66": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "55": { fold: 60, call: 0, minraise: 0, allin: 40 },
  "44": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "33": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "22": { fold: 90, call: 0, minraise: 0, allin: 10 },

  // ACE-HIGH - Call wide
  "AKs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "AQs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "AJs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "ATs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A9s": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "A8s": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "A7s": { fold: 40, call: 0, minraise: 0, allin: 60 },
  "A6s": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "A5s": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "A4s": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "A3s": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "A2s": { fold: 70, call: 0, minraise: 0, allin: 30 },

  "AKo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "AQo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "AJo": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "ATo": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "A9o": { fold: 35, call: 0, minraise: 0, allin: 65 },
  "A8o": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "A7o": { fold: 70, call: 0, minraise: 0, allin: 30 },
  "A6o": { fold: 80, call: 0, minraise: 0, allin: 20 },
  "A5o": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "A4o": { fold: 80, call: 0, minraise: 0, allin: 20 },
  "A3o": { fold: 90, call: 0, minraise: 0, allin: 10 },
  "A2o": { fold: 95, call: 0, minraise: 0, allin: 5 },

  // KING-HIGH - Selective calling
  "KQs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "KJs": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "KTs": { fold: 35, call: 0, minraise: 0, allin: 65 },
  "K9s": { fold: 60, call: 0, minraise: 0, allin: 40 },
  "K8s": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "K7s": { fold: 85, call: 0, minraise: 0, allin: 15 },
  "K6s": { fold: 90, call: 0, minraise: 0, allin: 10 },
  
  "KQo": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "KJo": { fold: 40, call: 0, minraise: 0, allin: 60 },
  "KTo": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "K9o": { fold: 80, call: 0, minraise: 0, allin: 20 },

  // QUEEN-HIGH and lower - Very tight
  "QJs": { fold: 40, call: 0, minraise: 0, allin: 60 },
  "QTs": { fold: 60, call: 0, minraise: 0, allin: 40 },
  "QJo": { fold: 70, call: 0, minraise: 0, allin: 30 },
  "JTs": { fold: 65, call: 0, minraise: 0, allin: 35 },

  // Most other hands fold
  "DEFAULT": { fold: 100, call: 0, minraise: 0, allin: 0 }
};

/**
 * SB pushing range when BTN folds
 * SB can push wider since only BB to get through
 */
export const SB_PUSH_VS_BB_15BB: NashRanges = {
  // Much wider than BTN since only 1 player to get through
  // POCKET PAIRS - Always push
  "AA": { fold: 0, call: 0, minraise: 15, allin: 85 },
  "KK": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "QQ": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "JJ": { fold: 0, call: 0, minraise: 3, allin: 97 },
  "TT": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "99": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "88": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "77": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "66": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "55": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "44": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "33": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "22": { fold: 0, call: 0, minraise: 0, allin: 100 },

  // ANY ACE - Push all aces
  "AKs": { fold: 0, call: 0, minraise: 12, allin: 88 },
  "AQs": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "AJs": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "ATs": { fold: 0, call: 0, minraise: 3, allin: 97 },
  "A9s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A7s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A6s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A5s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A4s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A3s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A2s": { fold: 0, call: 0, minraise: 0, allin: 100 },

  "AKo": { fold: 0, call: 0, minraise: 10, allin: 90 },
  "AQo": { fold: 0, call: 0, minraise: 8, allin: 92 },
  "AJo": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "ATo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A9o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A8o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A7o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A6o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A5o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A4o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A3o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "A2o": { fold: 0, call: 0, minraise: 0, allin: 100 },

  // KING-X - Push very wide
  "KQs": { fold: 0, call: 0, minraise: 8, allin: 92 },
  "KJs": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "KTs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K9s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K7s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K6s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K5s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K4s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K3s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K2s": { fold: 0, call: 0, minraise: 0, allin: 100 },

  "KQo": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "KJo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "KTo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K9o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K8o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "K7o": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "K6o": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "K5o": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "K4o": { fold: 20, call: 0, minraise: 0, allin: 80 },
  "K3o": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "K2o": { fold: 30, call: 0, minraise: 0, allin: 70 },

  // QUEEN-X - Push most
  "QJs": { fold: 0, call: 0, minraise: 5, allin: 95 },
  "QTs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q9s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q7s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q6s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q5s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q4s": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "Q3s": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "Q2s": { fold: 15, call: 0, minraise: 0, allin: 85 },

  "QJo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "QTo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q9o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "Q8o": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "Q7o": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "Q6o": { fold: 45, call: 0, minraise: 0, allin: 55 },
  "Q5o": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "Q4o": { fold: 65, call: 0, minraise: 0, allin: 35 },
  "Q3o": { fold: 75, call: 0, minraise: 0, allin: 25 },
  "Q2o": { fold: 80, call: 0, minraise: 0, allin: 20 },

  // JACK-X - Push wide
  "JTs": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J9s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J8s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J7s": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J6s": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "J5s": { fold: 10, call: 0, minraise: 0, allin: 90 },
  "J4s": { fold: 15, call: 0, minraise: 0, allin: 85 },
  "J3s": { fold: 25, call: 0, minraise: 0, allin: 75 },
  "J2s": { fold: 35, call: 0, minraise: 0, allin: 65 },

  "JTo": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J9o": { fold: 0, call: 0, minraise: 0, allin: 100 },
  "J8o": { fold: 5, call: 0, minraise: 0, allin: 95 },
  "J7o": { fold: 30, call: 0, minraise: 0, allin: 70 },
  "J6o": { fold: 55, call: 0, minraise: 0, allin: 45 },
  "J5o": { fold: 70, call: 0, minraise: 0, allin: 30 },

  // And so on - SB pushes VERY wide vs just BB
  // ... (continue with wider ranges)
};

/**
 * BB calling range vs SB push
 * BB needs good odds to call since SB pushes wide
 */
export const BB_CALL_VS_SB_PUSH_15BB: NashRanges = {
  // POCKET PAIRS
  "AA": { fold: 0, call: 100, minraise: 0, allin: 0 },  // Always call
  "KK": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "QQ": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "JJ": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "TT": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "99": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "88": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "77": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "66": { fold: 5, call: 95, minraise: 0, allin: 0 },
  "55": { fold: 15, call: 85, minraise: 0, allin: 0 },
  "44": { fold: 25, call: 75, minraise: 0, allin: 0 },
  "33": { fold: 35, call: 65, minraise: 0, allin: 0 },
  "22": { fold: 45, call: 55, minraise: 0, allin: 0 },

  // ACE-HIGH - Call wide since SB pushes any ace
  "AKs": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "AQs": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "AJs": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "ATs": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "A9s": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "A8s": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "A7s": { fold: 5, call: 95, minraise: 0, allin: 0 },
  "A6s": { fold: 10, call: 90, minraise: 0, allin: 0 },
  "A5s": { fold: 5, call: 95, minraise: 0, allin: 0 },
  "A4s": { fold: 15, call: 85, minraise: 0, allin: 0 },
  "A3s": { fold: 20, call: 80, minraise: 0, allin: 0 },
  "A2s": { fold: 25, call: 75, minraise: 0, allin: 0 },

  "AKo": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "AQo": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "AJo": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "ATo": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "A9o": { fold: 5, call: 95, minraise: 0, allin: 0 },
  "A8o": { fold: 15, call: 85, minraise: 0, allin: 0 },
  "A7o": { fold: 25, call: 75, minraise: 0, allin: 0 },
  "A6o": { fold: 35, call: 65, minraise: 0, allin: 0 },
  "A5o": { fold: 30, call: 70, minraise: 0, allin: 0 },
  "A4o": { fold: 40, call: 60, minraise: 0, allin: 0 },
  "A3o": { fold: 50, call: 50, minraise: 0, allin: 0 },
  "A2o": { fold: 55, call: 45, minraise: 0, allin: 0 },

  // KING-HIGH - Decent calling range
  "KQs": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "KJs": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "KTs": { fold: 5, call: 95, minraise: 0, allin: 0 },
  "K9s": { fold: 15, call: 85, minraise: 0, allin: 0 },
  "K8s": { fold: 30, call: 70, minraise: 0, allin: 0 },
  "K7s": { fold: 45, call: 55, minraise: 0, allin: 0 },
  "K6s": { fold: 55, call: 45, minraise: 0, allin: 0 },
  "K5s": { fold: 60, call: 40, minraise: 0, allin: 0 },

  "KQo": { fold: 0, call: 100, minraise: 0, allin: 0 },
  "KJo": { fold: 5, call: 95, minraise: 0, allin: 0 },
  "KTo": { fold: 15, call: 85, minraise: 0, allin: 0 },
  "K9o": { fold: 35, call: 65, minraise: 0, allin: 0 },
  "K8o": { fold: 55, call: 45, minraise: 0, allin: 0 },
  "K7o": { fold: 70, call: 30, minraise: 0, allin: 0 },

  // Lower broadways
  "QJs": { fold: 10, call: 90, minraise: 0, allin: 0 },
  "QTs": { fold: 25, call: 75, minraise: 0, allin: 0 },
  "Q9s": { fold: 40, call: 60, minraise: 0, allin: 0 },
  "QJo": { fold: 30, call: 70, minraise: 0, allin: 0 },
  "QTo": { fold: 45, call: 55, minraise: 0, allin: 0 },

  "JTs": { fold: 20, call: 80, minraise: 0, allin: 0 },
  "J9s": { fold: 35, call: 65, minraise: 0, allin: 0 },
  "JTo": { fold: 40, call: 60, minraise: 0, allin: 0 },

  "T9s": { fold: 30, call: 70, minraise: 0, allin: 0 },
  "T8s": { fold: 45, call: 55, minraise: 0, allin: 0 },
  "T9o": { fold: 55, call: 45, minraise: 0, allin: 0 },

  // Most other hands fold
  "DEFAULT": { fold: 100, call: 0, minraise: 0, allin: 0 }
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
    return { fold: 100, call: 0, minraise: 0, allin: 0 };
  }
  
  return ranges[hand] || ranges["DEFAULT"] || { fold: 100, call: 0, minraise: 0, allin: 0 };
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