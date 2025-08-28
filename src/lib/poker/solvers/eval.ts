// src/lib/poker/eval.ts

import type { Card } from "../engine";

// Ranks high-to-low for comparisons
const RANK_VAL: Record<string, number> = {
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

export type HandScore = { cat: number; tiebreak: number[] };
// cat: 8=StraightFlush,7=FourKind,6=FullHouse,5=Flush,4=Straight,3=Trips,2=TwoPair,1=OnePair,0=High

export function fullDeck(): Card[] {
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
  for (const r of ranks) for (const s of suits) deck.push((r + s) as Card);
  return deck;
}

export function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function removeCards(deck: Card[], remove: Card[]): Card[] {
  const toRemove = new Map<string, number>();
  for (const c of remove) toRemove.set(c, (toRemove.get(c) ?? 0) + 1);
  const out: Card[] = [];
  for (const c of deck) {
    const n = toRemove.get(c) ?? 0;
    if (n > 0) {
      toRemove.set(c, n - 1);
    } else {
      out.push(c);
    }
  }
  return out;
}

function rankValue(r: string): number {
  return RANK_VAL[r];
}
function parseCard(c: Card): { r: number; s: string } {
  const rankChar = c[0];
  const suit = c.slice(1); // supports unicode suits
  return { r: rankValue(rankChar), s: suit };
}

export function compareScore(a: HandScore, b: HandScore): number {
  if (a.cat !== b.cat) return a.cat - b.cat;
  const n = Math.max(a.tiebreak.length, b.tiebreak.length);
  for (let i = 0; i < n; i++) {
    const va = a.tiebreak[i] ?? 0,
      vb = b.tiebreak[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
}

export function eval5(cards: Card[]): HandScore {
  if (cards.length !== 5) throw new Error("eval5 requires exactly 5 cards");
  const parsed = cards.map(parseCard);
  const ranks = parsed.map((p) => p.r).sort((a, b) => b - a);
  const suits = parsed.map((p) => p.s);

  const byRank = new Map<number, number>();
  for (const r of ranks) byRank.set(r, (byRank.get(r) ?? 0) + 1);
  const groups = Array.from(byRank.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  // Flush?
  const suitCount: Record<string, number> = {};
  for (const s of suits) suitCount[s] = (suitCount[s] ?? 0) + 1;
  const flushSuit = Object.keys(suitCount).find((s) => suitCount[s] >= 5);

  // Straight helper (wheel)
  const uniqRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
  const isWheel =
    uniqRanks.includes(14) &&
    uniqRanks.includes(5) &&
    uniqRanks.includes(4) &&
    uniqRanks.includes(3) &&
    uniqRanks.includes(2);
  let straightHigh = 0;
  if (uniqRanks.length >= 5) {
    for (let i = 0; i <= uniqRanks.length - 5; i++) {
      const w = uniqRanks.slice(i, i + 5);
      if (w[0] - w[4] === 4) {
        straightHigh = w[0];
        break;
      }
    }
  }
  if (!straightHigh && isWheel) straightHigh = 5;

  // Straight flush?
  let sfHigh = 0;
  if (flushSuit) {
    const flushRanks = parsed
      .filter((p) => p.s === flushSuit)
      .map((p) => p.r)
      .sort((a, b) => b - a);
    const uniqF = Array.from(new Set(flushRanks));
    const isWheelF =
      uniqF.includes(14) &&
      uniqF.includes(5) &&
      uniqF.includes(4) &&
      uniqF.includes(3) &&
      uniqF.includes(2);
    if (uniqF.length >= 5) {
      for (let i = 0; i <= uniqF.length - 5; i++) {
        const w = uniqF.slice(i, i + 5);
        if (w[0] - w[4] === 4) {
          sfHigh = w[0];
          break;
        }
      }
    }
    if (!sfHigh && isWheelF) sfHigh = 5;
  }
  if (sfHigh) return { cat: 8, tiebreak: [sfHigh] };

  const [g1, g2] = groups;
  if (g1 && g1[1] === 4) {
    const kick = groups.find((g) => g[0] !== g1[0])?.[0] ?? 0;
    return { cat: 7, tiebreak: [g1[0], kick] };
  }
  if (g1 && g1[1] === 3 && g2 && g2[1] >= 2) {
    return { cat: 6, tiebreak: [g1[0], g2[0]] };
  }
  if (flushSuit) {
    const fr = parsed
      .filter((p) => p.s === flushSuit)
      .map((p) => p.r)
      .sort((a, b) => b - a)
      .slice(0, 5);
    return { cat: 5, tiebreak: fr };
  }
  if (straightHigh) return { cat: 4, tiebreak: [straightHigh] };
  if (g1 && g1[1] === 3) {
    const kick: number[] = [];
    for (const [r, c] of groups)
      if (r !== g1[0]) {
        for (let i = 0; i < c; i++) {
          kick.push(r);
          if (kick.length === 2) break;
        }
        if (kick.length === 2) break;
      }
    return { cat: 3, tiebreak: [g1[0], ...kick] };
  }
  const pairs = groups.filter((g) => g[1] === 2).map((g) => g[0]);
  if (pairs.length >= 2) {
    const [p1, p2] = pairs.slice(0, 2);
    const kicker = groups.find((g) => g[0] !== p1 && g[0] !== p2)?.[0] ?? 0;
    return { cat: 2, tiebreak: [p1, p2, kicker] };
  }
  if (pairs.length === 1) {
    const p = pairs[0];
    const kick: number[] = [];
    for (const [r, c] of groups)
      if (r !== p) {
        for (let i = 0; i < c; i++) {
          kick.push(r);
          if (kick.length === 3) break;
        }
        if (kick.length === 3) break;
      }
    return { cat: 1, tiebreak: [p, ...kick] };
  }
  const top5: number[] = [];
  for (const [r, c] of groups) {
    for (let i = 0; i < c; i++) {
      top5.push(r);
      if (top5.length === 5) break;
    }
    if (top5.length === 5) break;
  }
  return { cat: 0, tiebreak: top5 };
}

export function bestOf7(cards7: Card[]): HandScore {
  if (cards7.length !== 7) throw new Error("bestOf7 requires 7 cards");
  let best: HandScore | null = null;
  const idx = [0, 1, 2, 3, 4, 5, 6];
  for (let a = 0; a < 3; a++)
    for (let b = a + 1; b < 4; b++)
      for (let c = b + 1; c < 5; c++)
        for (let d = c + 1; d < 6; d++)
          for (let e = d + 1; e < 7; e++) {
            const five = [idx[a], idx[b], idx[c], idx[d], idx[e]].map(
              (i) => cards7[i]
            );
            const s = eval5(five);
            if (!best || compareScore(s, best) > 0) best = s;
          }
  return best!;
}
