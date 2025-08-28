/**
 * Nash Equilibrium Charts for 25BB Play
 * 
 * At 25BB we have more complex strategies:
 * - Min-raise/fold
 * - Min-raise/call 
 * - Limp/fold
 * - Limp/call
 * - Push all-in
 * 
 * These are based on solver outputs and tournament studies
 */

export interface ActionFrequencies {
  fold: number;
  limp: number;      // Call 1bb
  minraise: number;  // Raise to 2-2.5bb
  raise3x: number;   // Raise to 3bb
  allin: number;     // Push all-in
  
  // Response to aggression
  foldToRaise?: number;
  callRaise?: number;
  reraiseAllin?: number;
}

export interface RangeChart {
  [hand: string]: ActionFrequencies;
}

/**
 * BTN Opening Ranges at 25BB
 * BTN has the most complex strategy with many options
 */
export const BTN_OPEN_25BB: RangeChart = {
  // PREMIUM HANDS - Mix of raises and occasional traps
  "AA": { 
    fold: 0, 
    limp: 5,  // Sometimes trap
    minraise: 85,  // Usually min-raise
    raise3x: 5,
    allin: 5,  // Occasionally just ship it
    foldToRaise: 0,
    callRaise: 10,
    reraiseAllin: 90
  },
  "KK": { 
    fold: 0, 
    limp: 2,
    minraise: 88,
    raise3x: 5,
    allin: 5,
    foldToRaise: 0,
    callRaise: 5,
    reraiseAllin: 95
  },
  "QQ": {
    fold: 0,
    limp: 0,
    minraise: 90,
    raise3x: 5,
    allin: 5,
    foldToRaise: 0,
    callRaise: 15,
    reraiseAllin: 85
  },
  "JJ": {
    fold: 0,
    limp: 0,
    minraise: 92,
    raise3x: 3,
    allin: 5,
    foldToRaise: 0,
    callRaise: 25,
    reraiseAllin: 75
  },
  "TT": {
    fold: 0,
    limp: 0,
    minraise: 95,
    raise3x: 2,
    allin: 3,
    foldToRaise: 0,
    callRaise: 40,
    reraiseAllin: 60
  },
  "99": {
    fold: 0,
    limp: 3,
    minraise: 94,
    raise3x: 1,
    allin: 2,
    foldToRaise: 5,
    callRaise: 55,
    reraiseAllin: 40
  },
  "88": {
    fold: 0,
    limp: 5,
    minraise: 93,
    raise3x: 0,
    allin: 2,
    foldToRaise: 10,
    callRaise: 65,
    reraiseAllin: 25
  },
  "77": {
    fold: 0,
    limp: 8,
    minraise: 90,
    raise3x: 0,
    allin: 2,
    foldToRaise: 15,
    callRaise: 70,
    reraiseAllin: 15
  },
  "66": {
    fold: 0,
    limp: 12,
    minraise: 86,
    raise3x: 0,
    allin: 2,
    foldToRaise: 20,
    callRaise: 70,
    reraiseAllin: 10
  },
  "55": {
    fold: 5,
    limp: 15,
    minraise: 78,
    raise3x: 0,
    allin: 2,
    foldToRaise: 30,
    callRaise: 65,
    reraiseAllin: 5
  },
  "44": {
    fold: 10,
    limp: 20,
    minraise: 68,
    raise3x: 0,
    allin: 2,
    foldToRaise: 40,
    callRaise: 55,
    reraiseAllin: 5
  },
  "33": {
    fold: 20,
    limp: 25,
    minraise: 53,
    raise3x: 0,
    allin: 2,
    foldToRaise: 50,
    callRaise: 45,
    reraiseAllin: 5
  },
  "22": {
    fold: 30,
    limp: 30,
    minraise: 38,
    raise3x: 0,
    allin: 2,
    foldToRaise: 60,
    callRaise: 35,
    reraiseAllin: 5
  },

  // ACE-X SUITED
  "AKs": {
    fold: 0,
    limp: 0,
    minraise: 80,
    raise3x: 15,
    allin: 5,
    foldToRaise: 0,
    callRaise: 5,
    reraiseAllin: 95
  },
  "AQs": {
    fold: 0,
    limp: 0,
    minraise: 85,
    raise3x: 10,
    allin: 5,
    foldToRaise: 0,
    callRaise: 20,
    reraiseAllin: 80
  },
  "AJs": {
    fold: 0,
    limp: 0,
    minraise: 92,
    raise3x: 5,
    allin: 3,
    foldToRaise: 0,
    callRaise: 35,
    reraiseAllin: 65
  },
  "ATs": {
    fold: 0,
    limp: 2,
    minraise: 93,
    raise3x: 3,
    allin: 2,
    foldToRaise: 5,
    callRaise: 50,
    reraiseAllin: 45
  },
  "A9s": {
    fold: 0,
    limp: 5,
    minraise: 90,
    raise3x: 2,
    allin: 3,
    foldToRaise: 10,
    callRaise: 60,
    reraiseAllin: 30
  },
  "A8s": {
    fold: 0,
    limp: 8,
    minraise: 87,
    raise3x: 0,
    allin: 5,
    foldToRaise: 15,
    callRaise: 65,
    reraiseAllin: 20
  },
  "A7s": {
    fold: 0,
    limp: 10,
    minraise: 85,
    raise3x: 0,
    allin: 5,
    foldToRaise: 20,
    callRaise: 65,
    reraiseAllin: 15
  },
  "A6s": {
    fold: 5,
    limp: 12,
    minraise: 78,
    raise3x: 0,
    allin: 5,
    foldToRaise: 25,
    callRaise: 65,
    reraiseAllin: 10
  },
  "A5s": {
    fold: 0,
    limp: 8,
    minraise: 85,
    raise3x: 2,
    allin: 5,
    foldToRaise: 15,
    callRaise: 65,
    reraiseAllin: 20
  },
  "A4s": {
    fold: 0,
    limp: 10,
    minraise: 83,
    raise3x: 2,
    allin: 5,
    foldToRaise: 20,
    callRaise: 65,
    reraiseAllin: 15
  },
  "A3s": {
    fold: 5,
    limp: 15,
    minraise: 75,
    raise3x: 0,
    allin: 5,
    foldToRaise: 30,
    callRaise: 60,
    reraiseAllin: 10
  },
  "A2s": {
    fold: 10,
    limp: 18,
    minraise: 67,
    raise3x: 0,
    allin: 5,
    foldToRaise: 35,
    callRaise: 55,
    reraiseAllin: 10
  },

  // ACE-X OFFSUIT
  "AKo": {
    fold: 0,
    limp: 0,
    minraise: 82,
    raise3x: 13,
    allin: 5,
    foldToRaise: 0,
    callRaise: 15,
    reraiseAllin: 85
  },
  "AQo": {
    fold: 0,
    limp: 0,
    minraise: 88,
    raise3x: 8,
    allin: 4,
    foldToRaise: 0,
    callRaise: 35,
    reraiseAllin: 65
  },
  "AJo": {
    fold: 0,
    limp: 3,
    minraise: 92,
    raise3x: 3,
    allin: 2,
    foldToRaise: 10,
    callRaise: 55,
    reraiseAllin: 35
  },
  "ATo": {
    fold: 0,
    limp: 8,
    minraise: 87,
    raise3x: 2,
    allin: 3,
    foldToRaise: 20,
    callRaise: 65,
    reraiseAllin: 15
  },
  "A9o": {
    fold: 20,
    limp: 15,
    minraise: 60,
    raise3x: 0,
    allin: 5,
    foldToRaise: 45,
    callRaise: 50,
    reraiseAllin: 5
  },
  "A8o": {
    fold: 35,
    limp: 20,
    minraise: 40,
    raise3x: 0,
    allin: 5,
    foldToRaise: 60,
    callRaise: 35,
    reraiseAllin: 5
  },
  "A7o": {
    fold: 50,
    limp: 22,
    minraise: 25,
    raise3x: 0,
    allin: 3,
    foldToRaise: 75,
    callRaise: 20,
    reraiseAllin: 5
  },
  "A6o": {
    fold: 60,
    limp: 23,
    minraise: 15,
    raise3x: 0,
    allin: 2,
    foldToRaise: 85,
    callRaise: 10,
    reraiseAllin: 5
  },
  "A5o": {
    fold: 45,
    limp: 20,
    minraise: 30,
    raise3x: 0,
    allin: 5,
    foldToRaise: 70,
    callRaise: 25,
    reraiseAllin: 5
  },
  "A4o": {
    fold: 55,
    limp: 22,
    minraise: 20,
    raise3x: 0,
    allin: 3,
    foldToRaise: 80,
    callRaise: 15,
    reraiseAllin: 5
  },
  "A3o": {
    fold: 65,
    limp: 20,
    minraise: 12,
    raise3x: 0,
    allin: 3,
    foldToRaise: 85,
    callRaise: 10,
    reraiseAllin: 5
  },
  "A2o": {
    fold: 70,
    limp: 18,
    minraise: 10,
    raise3x: 0,
    allin: 2,
    foldToRaise: 90,
    callRaise: 5,
    reraiseAllin: 5
  },

  // KING-X SUITED
  "KQs": {
    fold: 0,
    limp: 0,
    minraise: 93,
    raise3x: 5,
    allin: 2,
    foldToRaise: 0,
    callRaise: 50,
    reraiseAllin: 50
  },
  "KJs": {
    fold: 0,
    limp: 3,
    minraise: 92,
    raise3x: 3,
    allin: 2,
    foldToRaise: 5,
    callRaise: 65,
    reraiseAllin: 30
  },
  "KTs": {
    fold: 0,
    limp: 5,
    minraise: 90,
    raise3x: 2,
    allin: 3,
    foldToRaise: 10,
    callRaise: 70,
    reraiseAllin: 20
  },
  "K9s": {
    fold: 0,
    limp: 10,
    minraise: 85,
    raise3x: 0,
    allin: 5,
    foldToRaise: 20,
    callRaise: 70,
    reraiseAllin: 10
  },
  "K8s": {
    fold: 10,
    limp: 15,
    minraise: 70,
    raise3x: 0,
    allin: 5,
    foldToRaise: 35,
    callRaise: 60,
    reraiseAllin: 5
  },
  "K7s": {
    fold: 25,
    limp: 20,
    minraise: 50,
    raise3x: 0,
    allin: 5,
    foldToRaise: 50,
    callRaise: 45,
    reraiseAllin: 5
  },
  "K6s": {
    fold: 35,
    limp: 25,
    minraise: 35,
    raise3x: 0,
    allin: 5,
    foldToRaise: 65,
    callRaise: 30,
    reraiseAllin: 5
  },
  "K5s": {
    fold: 45,
    limp: 25,
    minraise: 25,
    raise3x: 0,
    allin: 5,
    foldToRaise: 75,
    callRaise: 20,
    reraiseAllin: 5
  },
  "K4s": {
    fold: 55,
    limp: 25,
    minraise: 17,
    raise3x: 0,
    allin: 3,
    foldToRaise: 85,
    callRaise: 10,
    reraiseAllin: 5
  },

  // KING-X OFFSUIT
  "KQo": {
    fold: 0,
    limp: 5,
    minraise: 90,
    raise3x: 3,
    allin: 2,
    foldToRaise: 15,
    callRaise: 65,
    reraiseAllin: 20
  },
  "KJo": {
    fold: 5,
    limp: 10,
    minraise: 80,
    raise3x: 2,
    allin: 3,
    foldToRaise: 25,
    callRaise: 65,
    reraiseAllin: 10
  },
  "KTo": {
    fold: 15,
    limp: 15,
    minraise: 65,
    raise3x: 0,
    allin: 5,
    foldToRaise: 40,
    callRaise: 55,
    reraiseAllin: 5
  },

  // QUEEN-X SUITED
  "QJs": {
    fold: 0,
    limp: 5,
    minraise: 90,
    raise3x: 3,
    allin: 2,
    foldToRaise: 10,
    callRaise: 70,
    reraiseAllin: 20
  },
  "QTs": {
    fold: 0,
    limp: 8,
    minraise: 87,
    raise3x: 2,
    allin: 3,
    foldToRaise: 15,
    callRaise: 70,
    reraiseAllin: 15
  },
  "Q9s": {
    fold: 5,
    limp: 12,
    minraise: 78,
    raise3x: 0,
    allin: 5,
    foldToRaise: 25,
    callRaise: 70,
    reraiseAllin: 5
  },

  // QUEEN-X OFFSUIT
  "QJo": {
    fold: 10,
    limp: 15,
    minraise: 70,
    raise3x: 2,
    allin: 3,
    foldToRaise: 35,
    callRaise: 60,
    reraiseAllin: 5
  },
  "QTo": {
    fold: 25,
    limp: 20,
    minraise: 50,
    raise3x: 0,
    allin: 5,
    foldToRaise: 50,
    callRaise: 45,
    reraiseAllin: 5
  },
  "Q2o": {
    fold: 98,
    limp: 2,
    minraise: 0,
    raise3x: 0,
    allin: 0,
    foldToRaise: 100,
    callRaise: 0,
    reraiseAllin: 0
  },

  // JACK-X SUITED
  "JTs": {
    fold: 0,
    limp: 8,
    minraise: 87,
    raise3x: 2,
    allin: 3,
    foldToRaise: 15,
    callRaise: 70,
    reraiseAllin: 15
  },
  "J9s": {
    fold: 5,
    limp: 12,
    minraise: 78,
    raise3x: 0,
    allin: 5,
    foldToRaise: 25,
    callRaise: 70,
    reraiseAllin: 5
  },
  "J8s": {
    fold: 15,
    limp: 18,
    minraise: 62,
    raise3x: 0,
    allin: 5,
    foldToRaise: 35,
    callRaise: 60,
    reraiseAllin: 5
  },

  // JACK-X OFFSUIT
  "J8o": {
    fold: 55,
    limp: 20,
    minraise: 22,
    raise3x: 0,
    allin: 3,
    foldToRaise: 75,
    callRaise: 20,
    reraiseAllin: 5
  },

  // SUITED CONNECTORS
  "T9s": {
    fold: 0,
    limp: 10,
    minraise: 85,
    raise3x: 2,
    allin: 3,
    foldToRaise: 20,
    callRaise: 70,
    reraiseAllin: 10
  },
  "98s": {
    fold: 5,
    limp: 15,
    minraise: 75,
    raise3x: 0,
    allin: 5,
    foldToRaise: 30,
    callRaise: 65,
    reraiseAllin: 5
  },
  "87s": {
    fold: 15,
    limp: 20,
    minraise: 60,
    raise3x: 0,
    allin: 5,
    foldToRaise: 40,
    callRaise: 55,
    reraiseAllin: 5
  },
  "76s": {
    fold: 30,
    limp: 25,
    minraise: 40,
    raise3x: 0,
    allin: 5,
    foldToRaise: 55,
    callRaise: 40,
    reraiseAllin: 5
  },
  "65s": {
    fold: 40,
    limp: 28,
    minraise: 27,
    raise3x: 0,
    allin: 5,
    foldToRaise: 65,
    callRaise: 30,
    reraiseAllin: 5
  },
  "54s": {
    fold: 50,
    limp: 30,
    minraise: 17,
    raise3x: 0,
    allin: 3,
    foldToRaise: 75,
    callRaise: 20,
    reraiseAllin: 5
  },

  // TRASH HANDS
  "43s": {
    fold: 75,
    limp: 20,
    minraise: 5,
    raise3x: 0,
    allin: 0,
    foldToRaise: 95,
    callRaise: 5,
    reraiseAllin: 0
  },
  "43o": {
    fold: 100,
    limp: 0,
    minraise: 0,
    raise3x: 0,
    allin: 0,
    foldToRaise: 100,
    callRaise: 0,
    reraiseAllin: 0
  },
  "32o": {
    fold: 100,
    limp: 0,
    minraise: 0,
    raise3x: 0,
    allin: 0,
    foldToRaise: 100,
    callRaise: 0,
    reraiseAllin: 0
  },

  // Add more hands as needed...
};

/**
 * SB vs BTN Open at 25BB
 * SB has to play out of position so ranges are tighter
 */
export const SB_VS_BTN_OPEN_25BB: RangeChart = {
  // Premium hands 3-bet or call
  "AA": {
    fold: 0,
    limp: 0,
    minraise: 0,
    raise3x: 85,  // 3-bet most of the time
    allin: 10,
    foldToRaise: 0,
    callRaise: 5,  // Sometimes flat to trap
    reraiseAllin: 0
  },
  "KK": {
    fold: 0,
    limp: 0,
    minraise: 0,
    raise3x: 80,
    allin: 10,
    foldToRaise: 0,
    callRaise: 10,
    reraiseAllin: 0
  },
  "QQ": {
    fold: 0,
    limp: 0,
    minraise: 0,
    raise3x: 70,
    allin: 5,
    foldToRaise: 0,
    callRaise: 25,
    reraiseAllin: 0
  },
  "AKs": {
    fold: 0,
    limp: 0,
    minraise: 0,
    raise3x: 75,
    allin: 10,
    foldToRaise: 0,
    callRaise: 15,
    reraiseAllin: 0
  },
  // ... Continue with more hands
};

/**
 * Helper to get optimal action based on frequencies
 */
export function getOptimalAction25BB(
  hand: string,
  position: 'BTN' | 'SB' | 'BB',
  situation: 'open' | 'vs_open' | 'vs_3bet'
): ActionFrequencies {
  let chart: RangeChart;
  
  if (position === 'BTN' && situation === 'open') {
    chart = BTN_OPEN_25BB;
  } else if (position === 'SB' && situation === 'vs_open') {
    chart = SB_VS_BTN_OPEN_25BB;
  } else {
    // Return default tight range
    return {
      fold: 90,
      limp: 5,
      minraise: 5,
      raise3x: 0,
      allin: 0
    };
  }
  
  return chart[hand] || {
    fold: 100,
    limp: 0,
    minraise: 0,
    raise3x: 0,
    allin: 0
  };
}

/**
 * Calculate EV for each action at 25BB
 * These are approximations based on typical outcomes
 */
export function calculateEVs25BB(
  hand: string,
  position: string,
  pot: number,
  toCall: number,
  stack: number
): { fold: number; call: number; raise: number; allin: number } {
  const frequencies = getOptimalAction25BB(
    hand, 
    position as 'BTN' | 'SB' | 'BB',
    toCall > 0 ? 'vs_open' : 'open'
  );
  
  // Base EVs on how often action is taken in equilibrium
  // If Nash takes an action frequently, it's +EV
  
  const foldEV = -toCall * 0.5; // Lose half of what we've invested
  
  const callEV = frequencies.limp > 30 
    ? pot * 0.1  // Decent calling hand
    : frequencies.limp > 10
    ? pot * 0.05  // Marginal call
    : -toCall * 0.7; // Bad call
  
  const raiseEV = frequencies.minraise > 60
    ? pot * 0.4  // Strong raising hand
    : frequencies.minraise > 30
    ? pot * 0.2  // Decent raise
    : frequencies.minraise > 10
    ? pot * 0.05  // Marginal raise
    : -stack * 0.15; // Bad raise
  
  const allinEV = frequencies.allin > 10
    ? pot * 0.5  // Strong all-in
    : frequencies.allin > 5
    ? pot * 0.2  // Decent shove
    : frequencies.allin > 0
    ? -stack * 0.1  // Marginal shove
    : -stack * 0.4; // Terrible shove
  
  return {
    fold: foldEV,
    call: callEV,
    raise: raiseEV,
    allin: allinEV
  };
}