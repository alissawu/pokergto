/**
 * Core Poker Game Engine
 * Types and game logic for Texas Hold'em
 */

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";
export type Card = `${Rank}${Suit}`;

export const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
export const RANKS: Rank[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
];

export type Action = "fold" | "check" | "call" | "raise" | "bet" | "all-in";
export type Street = "preflop" | "flop" | "turn" | "river";

export interface Player {
  id: string;
  name: string;
  stack: number;
  cards: [Card, Card] | [];
  currentBet: number;
  totalInvested: number;
  hasFolded: boolean;
  isAllIn: boolean;
  isHero: boolean;
  position: number;
  isDealer?: boolean;
  isSB?: boolean;
  isBB?: boolean;
}

export interface GameState {
  players: Player[];
  board: Card[];
  pot: number;
  currentBet: number;
  street: Street;
  actionOn: string; // player id
  history: ActionHistory[];
  deck: Card[];
}

export interface ActionHistory {
  playerId: string;
  action: Action;
  amount?: number;
  street: Street;
  timestamp: number;
}

export interface HandRank {
  rank: number; // 1-9 (high card to straight flush)
  name: string;
  cards: Card[];
  kickers: Card[];
}

export class PokerGame {
  private state: GameState;
  private startingStacks: Map<string, number> = new Map();

  constructor(players: Player[], blinds: { sb: number; bb: number }) {
    // Initialize deck
    const deck = this.createDeck();
    this.shuffle(deck);

    // Set up players
    const gamePlayers = players.map((p, i) => ({
      ...p,
      currentBet: 0,
      totalInvested: 0,
      hasFolded: false,
      isAllIn: false,
      position: i,
      cards: [] as [],
      // Preserve position flags if already set, otherwise assign based on index
      isDealer: p.isDealer !== undefined ? p.isDealer : i === 0,
      isSB: p.isSB !== undefined ? p.isSB : i === (1 % players.length),
      isBB: p.isBB !== undefined ? p.isBB : i === (2 % players.length),
    }));

    // Post blinds - find players by their position flags
    const sbPlayer = gamePlayers.find(p => p.isSB);
    const bbPlayer = gamePlayers.find(p => p.isBB);
    
    if (sbPlayer) {
      sbPlayer.currentBet = blinds.sb;
      sbPlayer.stack -= blinds.sb;
      sbPlayer.totalInvested = blinds.sb;
    }
    
    if (bbPlayer) {
      bbPlayer.currentBet = blinds.bb;
      bbPlayer.stack -= blinds.bb;
      bbPlayer.totalInvested = blinds.bb;
    }

    // In 3-player game preflop: After blinds are posted, BTN acts first (UTG position)
    // Action order: BTN → SB → BB (BB has option to check/raise even if just called)
    const dealerIndex = gamePlayers.findIndex((p) => p.isDealer);
    const bbPlayerIndex = gamePlayers.findIndex((p) => p.isBB);
    const firstToAct =
      players.length === 3
        ? gamePlayers[dealerIndex].id
        : gamePlayers[(bbPlayerIndex + 1) % players.length].id;

    this.state = {
      players: gamePlayers,
      board: [],
      pot: blinds.sb + blinds.bb,
      currentBet: blinds.bb,
      street: "preflop",
      actionOn: firstToAct,
      history: [],
      deck,
    };

    // Store starting stacks
    players.forEach((p) => this.startingStacks.set(p.id, p.stack));

    // Deal cards
    this.dealHoleCards();
  }

  private createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push(`${rank}${suit}` as Card);
      }
    }
    return deck;
  }

  private shuffle(deck: Card[]): void {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  private dealHoleCards(): void {
    for (const player of this.state.players) {
      if (!player.hasFolded) {
        player.cards = [this.state.deck.pop()!, this.state.deck.pop()!];
      }
    }
  }

  public getState(): GameState {
    return { ...this.state };
  }

  public getLegalActions(playerId: string): Action[] {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.hasFolded || player.isAllIn) return [];

    const actions: Action[] = [];
    const toCall = this.state.currentBet - player.currentBet;

    if (toCall === 0) {
      actions.push("check");
      if (player.stack > 0) {
        actions.push("bet");
        actions.push("all-in"); // Can always go all-in when you have chips
      }
    } else {
      actions.push("fold");
      if (player.stack >= toCall) {
        actions.push("call");
        if (player.stack > toCall) {
          actions.push("raise");
          actions.push("all-in"); // Can always go all-in when you have chips
        }
      } else if (player.stack > 0) {
        // Stack is less than toCall, so calling = all-in
        actions.push("all-in");
      }
    }

    return actions;
  }

  public executeAction(
    playerId: string,
    action: Action,
    amount?: number
  ): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || this.state.actionOn !== playerId) return false;

    const legalActions = this.getLegalActions(playerId);
    if (!legalActions.includes(action)) return false;

    // Record action
    this.state.history.push({
      playerId,
      action,
      amount,
      street: this.state.street,
      timestamp: Date.now(),
    });

    // Execute action
    switch (action) {
      case "fold":
        player.hasFolded = true;
        break;

      case "check":
        // No change needed
        break;

      case "call":
        const toCall = Math.min(
          this.state.currentBet - player.currentBet,
          player.stack
        );
        player.stack -= toCall;
        player.currentBet += toCall;
        player.totalInvested += toCall;
        this.state.pot += toCall;
        if (player.stack === 0) player.isAllIn = true;
        break;

      case "bet":
        const betSize = amount || this.state.pot * 0.66;
        const actualBet = Math.min(betSize, player.stack);
        player.stack -= actualBet;
        player.currentBet += actualBet;
        player.totalInvested += actualBet;
        this.state.pot += actualBet;
        this.state.currentBet = player.currentBet;
        if (player.stack === 0) player.isAllIn = true;
        break;

      case "raise":
        // Minimum raise is 2x current bet or the size of the last raise
        const minRaise = this.state.currentBet * 2;
        const targetAmount =
          amount ||
          Math.max(minRaise, this.state.currentBet + this.state.pot * 0.66);
        const toAdd = Math.min(targetAmount - player.currentBet, player.stack);

        // Ensure it's at least a min raise
        if (player.currentBet + toAdd < minRaise && toAdd < player.stack) {
          // If can't make min raise, must go all-in or just call
          return false;
        }

        player.stack -= toAdd;
        player.currentBet += toAdd;
        player.totalInvested += toAdd;
        this.state.pot += toAdd;
        this.state.currentBet = player.currentBet;
        if (player.stack === 0) player.isAllIn = true;
        break;

      case "all-in":
        this.state.pot += player.stack;
        player.totalInvested += player.stack;
        player.currentBet += player.stack;
        if (player.currentBet > this.state.currentBet) {
          this.state.currentBet = player.currentBet;
        }
        player.stack = 0;
        player.isAllIn = true;
        break;
    }

    // Move to next player or street
    this.advanceGame();
    return true;
  }

  private advanceGame(): void {
    const activePlayers = this.state.players.filter((p) => !p.hasFolded);

    // Check if hand is over - only one player remains
    if (activePlayers.length === 1) {
      this.endHand();
      return;
    }

    // Check if all remaining active players have acted this street
    const activeNonAllIn = activePlayers.filter((p) => !p.isAllIn);

    // If everyone is all-in, go to showdown
    if (activeNonAllIn.length === 0) {
      // Run out remaining streets
      while (this.state.street !== "river" && this.state.board.length < 5) {
        this.dealNextStreetCards();
      }
      this.endHand();
      return;
    }

    // Check if betting round is complete
    const bettingComplete = activeNonAllIn.every((p) => {
      // Player has matched the current bet
      if (p.currentBet === this.state.currentBet) {
        // Special case: BB preflop gets option even if bet is matched
        if (
          this.state.street === "preflop" &&
          p.isBB &&
          !this.hasActedThisStreet(p.id)
        ) {
          return false;
        }
        return true;
      }
      return false;
    });

    if (bettingComplete) {
      // If there's been action this street, move to next street
      if (this.state.history.some((h) => h.street === this.state.street)) {
        this.nextStreet();
      } else {
        // No action yet, continue betting round
        this.nextPlayer();
      }
    } else {
      // Move to next player
      this.nextPlayer();
    }
  }

  private dealNextStreetCards(): void {
    switch (this.state.street) {
      case "preflop":
        this.state.street = "flop";
        this.state.board.push(
          this.state.deck.pop()!,
          this.state.deck.pop()!,
          this.state.deck.pop()!
        );
        break;
      case "flop":
        this.state.street = "turn";
        this.state.board.push(this.state.deck.pop()!);
        break;
      case "turn":
        this.state.street = "river";
        this.state.board.push(this.state.deck.pop()!);
        break;
    }
  }

  private hasActedThisStreet(playerId: string): boolean {
    // Check if player has acted in current street
    const streetActions = this.state.history.filter(
      (h) => h.playerId === playerId && h.street === this.state.street
    );
    return streetActions.length > 0;
  }

  private nextPlayer(): void {
    const currentIndex = this.state.players.findIndex(
      (p) => p.id === this.state.actionOn
    );
    let nextIndex = (currentIndex + 1) % this.state.players.length;
    let attempts = 0;

    // Find next active player who needs to act
    while (attempts < this.state.players.length) {
      const nextPlayer = this.state.players[nextIndex];

      // Skip if folded or all-in
      if (nextPlayer.hasFolded || nextPlayer.isAllIn) {
        nextIndex = (nextIndex + 1) % this.state.players.length;
        attempts++;
        continue;
      }

      // Check if this player needs to act
      if (nextPlayer.currentBet < this.state.currentBet) {
        // Player needs to act (call, raise, or fold)
        this.state.actionOn = nextPlayer.id;
        return;
      }

      // Special case: BB preflop option
      if (
        this.state.street === "preflop" &&
        nextPlayer.isBB &&
        nextPlayer.currentBet === this.state.currentBet &&
        !this.hasActedThisStreet(nextPlayer.id)
      ) {
        this.state.actionOn = nextPlayer.id;
        return;
      }

      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }

    // No player needs to act, move to next street
    this.nextStreet();
  }

  private nextStreet(): void {
    const activePlayers = this.state.players.filter(
      (p) => !p.hasFolded && !p.isAllIn
    );

    // If no one can act, go to showdown
    if (activePlayers.length === 0) {
      this.endHand();
      return;
    }

    // Reset current bets for the new street
    this.state.players.forEach((p) => {
      p.currentBet = 0;
    });
    this.state.currentBet = 0;

    // Deal community cards
    switch (this.state.street) {
      case "preflop":
        this.state.street = "flop";
        this.state.board.push(
          this.state.deck.pop()!,
          this.state.deck.pop()!,
          this.state.deck.pop()!
        );
        break;
      case "flop":
        this.state.street = "turn";
        this.state.board.push(this.state.deck.pop()!);
        break;
      case "turn":
        this.state.street = "river";
        this.state.board.push(this.state.deck.pop()!);
        break;
      case "river":
        this.endHand();
        return;
    }

    // Find first active player to act (postflop: first after button)
    const dealerIndex = this.state.players.findIndex((p) => p.isDealer);
    let nextIndex = (dealerIndex + 1) % this.state.players.length;
    let attempts = 0;

    while (
      (this.state.players[nextIndex].hasFolded ||
        this.state.players[nextIndex].isAllIn) &&
      attempts < this.state.players.length
    ) {
      nextIndex = (nextIndex + 1) % this.state.players.length;
      attempts++;
    }

    if (attempts >= this.state.players.length) {
      // No one can act, go to next street or showdown
      this.nextStreet();
      return;
    }

    this.state.actionOn = this.state.players[nextIndex].id;
  }

  private endHand(): void {
    const activePlayers = this.state.players.filter((p) => !p.hasFolded);

    if (activePlayers.length === 1) {
      // Winner by fold
      activePlayers[0].stack += this.state.pot;
    } else {
      // Showdown - evaluate hands and distribute pot
      const winners = this.evaluateShowdown(activePlayers);
      const potShare = this.state.pot / winners.length;
      winners.forEach((w) => (w.stack += potShare));
    }

    // Reset for next hand (in practice mode, we'd start a new hand)
    this.state.pot = 0;
    this.state.actionOn = ""; // Clear action to indicate hand is over
  }

  private evaluateShowdown(players: Player[]): Player[] {
    // Simplified - in production would use proper hand evaluator
    // For now, just return random winner(s)
    return [players[Math.floor(Math.random() * players.length)]];
  }

  public evaluateHand(cards: Card[], board: Card[]): HandRank {
    // Simplified hand evaluation
    // In production, would implement full hand ranking
    return {
      rank: Math.floor(Math.random() * 9) + 1,
      name: "High Card",
      cards: cards.slice(0, 5),
      kickers: [],
    };
  }
}
