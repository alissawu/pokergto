// Comprehensive Poker Curriculum Structure
// Designed for intuitive learning and deep understanding

export interface Exercise {
  id: string;
  type: "quiz" | "calculation" | "scenario" | "interactive" | "game";
  question?: string;
  setup?: any;
  checkAnswer: (answer: any) => { correct: boolean; explanation: string };
  hints?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  estimatedTime: string; // in minutes
  objectives: string[];
  hook: {
    question: string;
    scenario?: string;
    reveal: string;
  };
  theory: {
    concept: string;
    explanation: string;
    examples: Array<{
      title: string;
      description: string;
      visual?: any; // Component or visual aid
    }>;
    keyTakeaways: string[];
  };
  practice: {
    warmup: Exercise[];
    core: Exercise[];
    challenge: Exercise[];
  };
  mastery: {
    criteria: string[];
    selfCheck: string[];
  };
}

export interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  prerequisites: number[]; // Module IDs
  lessons: Lesson[];
  capstoneProject?: {
    title: string;
    description: string;
    requirements: string[];
  };
}

// MODULE 1: FOUNDATIONS - From Zero to Playable
export const module1: Module = {
  id: 1,
  title: "Foundations: From Zero to Playable",
  description: "Master the fundamentals that separate players from gamblers",
  icon: "🎯",
  color: "from-green-600 to-green-700",
  prerequisites: [],
  lessons: [
    {
      id: "1.1",
      title: "The Hidden Mathematics of Winning",
      subtitle: "Why poker is a game of decisions, not cards",
      estimatedTime: "20",
      objectives: [
        "Understand Expected Value as the core of poker decisions",
        "Calculate simple EV scenarios",
        "Recognize positive vs negative EV spots",
      ],
      hook: {
        question:
          "Would you flip a coin for $100 if heads wins you $150 but tails loses your $100?",
        scenario:
          "This is a +EV bet. You'll win $150 half the time and lose $100 half the time.",
        reveal:
          "EV = 0.5 × $150 - 0.5 × $100 = $75 - $50 = +$25. Every poker decision is this same calculation in disguise.",
      },
      theory: {
        concept: "Expected Value (EV)",
        explanation: `Expected Value is the average outcome if you could repeat a decision infinitely. In poker, every action has an EV: folding (0 EV), calling, raising, or checking. The goal is to always make the highest EV decision.

        The formula: EV = Σ(Probability × Outcome)
        
        This single concept separates winning players from losing ones. While you can't control what cards come, you can control making +EV decisions consistently.`,
        examples: [
          {
            title: "The Coin Flip Bet",
            description:
              "50% chance to win $150, 50% chance to lose $100. EV = (0.5 × $150) - (0.5 × $100) = +$25",
          },
          {
            title: "The Bluff",
            description:
              "You bet $100 into a $100 pot. If opponent folds 60% of the time: EV = (0.6 × $100) - (0.4 × $100) = +$20",
          },
          {
            title: "The Bad Call",
            description:
              "Calling $50 to win $100 with only 20% equity: EV = (0.2 × $150) - (0.8 × $50) = $30 - $40 = -$10",
          },
        ],
        keyTakeaways: [
          "Every poker decision has an Expected Value",
          "Positive EV (+EV) decisions make money long-term",
          "Negative EV (-EV) decisions lose money long-term",
          "Variance affects short-term results, but EV determines long-term profits",
        ],
      },
      practice: {
        warmup: [
          {
            id: "ev-1",
            type: "calculation",
            question:
              "You bet $20 into a $40 pot. Your opponent folds 70% of the time. What's your EV?",
            checkAnswer: (answer: number) => {
              const correct = 0.7 * 40 - 0.3 * 20; // $28 - $6 = $22
              return {
                correct: Math.abs(answer - correct) < 0.5,
                explanation: `When they fold (70%): You win $40. When they call (30%): You lose $20. EV = (0.7 × $40) - (0.3 × $20) = $28 - $6 = +$22`,
              };
            },
            hints: ["Calculate: (Fold% × Pot) - (Call% × YourBet)"],
          },
        ],
        core: [],
        challenge: [],
      },
      mastery: {
        criteria: [
          "Calculate EV for simple betting scenarios",
          "Identify whether a decision is +EV or -EV",
          "Explain why EV matters more than individual results",
        ],
        selfCheck: [
          "Can I calculate the EV of a bet when I know fold frequency?",
          "Do I understand why a +EV play can still lose?",
          "Can I explain why we focus on EV instead of results?",
        ],
      },
    },
    {
      id: "1.2",
      title: "Hand Rankings: The Language of Poker",
      subtitle: "What beats what and why kickers matter",
      estimatedTime: "15",
      objectives: [
        "Master all hand rankings instantly",
        "Understand kicker rules and split pots",
        "Identify the nuts on any board",
      ],
      hook: {
        question:
          "You have KK, opponent has AK, board shows K-7-3-2-9. Who wins?",
        scenario: "Both players have a set of Kings, but...",
        reveal:
          "You win! You have three Kings (set), they have one pair of Kings. Sets beat pairs every time.",
      },
      theory: {
        concept: "Hand Rankings & Kickers",
        explanation: `Poker hands are ranked by rarity and mathematical probability. The rarer the hand, the stronger it is.

        Critical concept: KICKERS
        When players have the same hand rank, the highest unpaired cards (kickers) determine the winner.
        
        Example: Both have a pair of Aces
        - Player A: A♠A♥K♦Q♣J♠
        - Player B: A♦A♣K♠Q♥10♦
        Winner: Player A (Jack kicker beats Ten kicker)`,
        examples: [
          {
            title: "The Costly Kicker",
            description:
              "A♦K♣ vs A♥Q♠ on board A♠7♣3♥2♦9♠ - Both have a pair of Aces, but King kicker wins",
          },
          {
            title: "The Split Pot",
            description:
              "A♦K♣ vs A♥K♠ on board A♠Q♣J♥10♦9♠ - Both have Ace-high straight, pot splits",
          },
          {
            title: "The Counterfeit",
            description:
              "8♦8♣ vs A♥K♠ on board 9♠9♥9♦Q♣J♥ - The board plays (three 9s + QJ), pot splits!",
          },
        ],
        keyTakeaways: [
          "Higher pairs beat lower pairs, but sets beat all pairs",
          "Kickers matter when hands are tied",
          "The board can 'counterfeit' your hand",
          "Always use the best 5 cards from the 7 available",
        ],
      },
      practice: {
        warmup: [],
        core: [],
        challenge: [],
      },
      mastery: {
        criteria: [
          "Identify hand rankings in under 2 seconds",
          "Determine winners when kickers matter",
          "Recognize when the board plays",
        ],
        selfCheck: [
          "Can I instantly identify what hand I have?",
          "Do I know who wins when both have the same pair?",
          "Can I spot when my hand is counterfeited?",
        ],
      },
    },
    {
      id: "1.3",
      title: "Outs & Odds: Seeing the Future",
      subtitle: "Calculate your chances like a pro",
      estimatedTime: "25",
      objectives: [
        "Count outs quickly and accurately",
        "Use the Rule of 2 and 4",
        "Identify hidden outs and discounted outs",
      ],
      hook: {
        question:
          "You have A♥K♥ on a flop of Q♥J♥3♣. How many cards give you the best hand?",
        scenario: "Count all the cards that improve your hand...",
        reveal:
          "You have 9 hearts for a flush + 3 tens for a straight (the T♥ is already counted) = 12 outs! Plus 6 more for top pair. That's 18 outs - you're actually favored to win!",
      },
      theory: {
        concept: "Outs and Probability",
        explanation: `Outs are cards that improve your hand. Counting outs lets you calculate your winning probability.

        THE RULE OF 2 AND 4:
        • With one card to come: Outs × 2 = Approximate winning %
        • With two cards to come: Outs × 4 = Approximate winning %
        
        Example: 9 outs (flush draw)
        • Turn only: 9 × 2 = 18%
        • Turn + River: 9 × 4 = 36%
        
        HIDDEN OUTS: Cards that help in unexpected ways
        DISCOUNTED OUTS: Outs that might not be good (make opponent better hand)`,
        examples: [
          {
            title: "Flush Draw",
            description:
              "You have A♠K♠ on 9♠4♠2♥. Any spade (9 outs) gives you the nut flush.",
          },
          {
            title: "Combo Draw",
            description:
              "You have J♥T♥ on 9♥8♥2♣. Hearts (9) + Q/7 for straight (6 more) = 15 outs!",
          },
          {
            title: "Discounted Outs",
            description:
              "You have A♥K♦ on Q♣J♦T♦. Any 9 makes a straight, but 9♦ might give opponent a flush.",
          },
        ],
        keyTakeaways: [
          "Flush draw = 9 outs, Open-ended straight = 8 outs",
          "Combo draws can have 12-15+ outs",
          "Some outs should be discounted if they help opponents",
          "The Rule of 2 and 4 gives quick equity estimates",
        ],
      },
      practice: {
        warmup: [],
        core: [],
        challenge: [],
      },
      mastery: {
        criteria: [
          "Count outs in under 5 seconds",
          "Apply the Rule of 2 and 4 accurately",
          "Identify which outs might be bad",
        ],
        selfCheck: [
          "Can I quickly count all my outs?",
          "Do I know my winning percentage with X outs?",
          "Can I identify when outs should be discounted?",
        ],
      },
    },
    {
      id: "1.4",
      title: "Pot Odds: The Price is Right",
      subtitle: "When to call, when to fold - mathematically",
      estimatedTime: "20",
      objectives: [
        "Calculate pot odds instantly",
        "Compare pot odds to equity",
        "Understand implied odds basics",
      ],
      hook: {
        question:
          "Opponent bets $50 into a $100 pot. You have a flush draw (36% chance). Call or fold?",
        scenario: "You need to risk $50 to win $150 total...",
        reveal:
          "Call! You need 25% equity to call (50/200 = 25%). You have 36% equity. This call makes money long-term.",
      },
      theory: {
        concept: "Pot Odds and Required Equity",
        explanation: `Pot odds tell you the price you're getting on a call. Compare this to your equity (winning chances) to make profitable decisions.

        POT ODDS FORMULA:
        Pot Odds = Call Amount / (Pot + Call Amount)
        
        This gives you the MINIMUM EQUITY needed to call profitably.
        
        Quick Reference:
        • Half-pot bet → Need 25% equity
        • Pot-sized bet → Need 33% equity  
        • 2x pot bet → Need 40% equity
        
        IMPLIED ODDS: Future money you might win
        Sometimes a call is correct even without direct odds because you'll win more when you hit.`,
        examples: [
          {
            title: "The Easy Call",
            description:
              "Bet: $25 into $100. You need 25/150 = 16.7% equity. Any decent draw calls.",
          },
          {
            title: "The Close Spot",
            description:
              "Bet: $75 into $100. You need 75/250 = 30% equity. Only strong draws call.",
          },
          {
            title: "Implied Odds Save",
            description:
              "You need 30% but have 25%. If you'll win an extra $50 when you hit, call becomes profitable.",
          },
        ],
        keyTakeaways: [
          "Pot odds = the price you're getting",
          "Compare pot odds to your equity",
          "If equity > pot odds, calling is +EV",
          "Implied odds can make borderline calls profitable",
        ],
      },
      practice: {
        warmup: [],
        core: [],
        challenge: [],
      },
      mastery: {
        criteria: [
          "Calculate pot odds for any bet size",
          "Know required equity for common bet sizes",
          "Factor in basic implied odds",
        ],
        selfCheck: [
          "Can I calculate pot odds quickly?",
          "Do I know if I have the right price to call?",
          "Can I estimate implied odds in simple spots?",
        ],
      },
    },
    {
      id: "1.5",
      title: "Position: Your Unfair Advantage",
      subtitle: "Why acting last is worth money",
      estimatedTime: "20",
      objectives: [
        "Understand positional advantage",
        "Adjust ranges by position",
        "Exploit position post-flop",
      ],
      hook: {
        question:
          "Would you rather act first or last when negotiating a price?",
        scenario:
          "In poker, acting last is like seeing your opponent's offer before making yours...",
        reveal:
          "Position is so powerful that the same hand can be a fold early and a raise on the button!",
      },
      theory: {
        concept: "Positional Advantage",
        explanation: `Position is your location relative to the dealer button. Acting last gives you more information before making decisions.

        POSITIONS (6-max):
        • UTG (Under the Gun) - Acts first, plays tight
        • MP (Middle Position) - Slightly wider
        • CO (Cutoff) - Much wider  
        • BTN (Button) - Widest range, acts last post-flop
        • SB (Small Blind) - Acts second-to-last pre, first post
        • BB (Big Blind) - Acts last pre, second post
        
        Why position matters:
        1. Information - You see what others do first
        2. Pot control - Easier to manage pot size
        3. Bluffing - More credible from late position
        4. Realize equity - See more cards cheaply`,
        examples: [
          {
            title: "Same Hand, Different Position",
            description:
              "K♣J♦ is a fold UTG but a raise on BTN. Position changes everything.",
          },
          {
            title: "The Float Play",
            description:
              "In position, you can call with nothing and take it away on later streets.",
          },
          {
            title: "Value Extraction",
            description:
              "With position, you can value bet thinner because you control the action.",
          },
        ],
        keyTakeaways: [
          "Position = Information = Power",
          "Play tighter from early position",
          "The button is the most profitable position",
          "Position matters more post-flop than pre-flop",
        ],
      },
      practice: {
        warmup: [],
        core: [],
        challenge: [],
      },
      mastery: {
        criteria: [
          "Name all positions at a 6-max table",
          "Adjust opening ranges by position",
          "Use position to win without showdown",
        ],
        selfCheck: [
          "Do I know why position matters?",
          "Can I adjust my ranges by position?",
          "Do I use position to control pots?",
        ],
      },
    },
  ],
  capstoneProject: {
    title: "Play 100 Hands with Positive EV",
    description: "Apply all fundamentals in real games",
    requirements: [
      "Track your decisions and their EV",
      "Achieve 60%+ correct decisions",
      "Identify your biggest leaks",
    ],
  },
};

// Export all modules
export const curriculum: Module[] = [
  module1,
  // module2, module3, etc. will be added
];

export default curriculum;
