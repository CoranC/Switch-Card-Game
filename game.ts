import * as Colors from "https://deno.land/std/fmt/colors.ts";
import { HandConsequence, Suit } from "./enums.ts";
import Logger from "./logger.ts";
import Player from "./player.ts";
import Card from "./card.ts";
import Deck from "./deck.ts";
import Referee from "./referee.ts";

export default class Game {
  deck: Deck = new Deck();
  currentShowingCard: Card;
  players: Player[] = [];
  currentPlayersTurn: number | null = null;
  gameDetails = {
    playerCount: 2,
    cardCount: 5,
    gameOver: false,
  };
  referee = new Referee();

  constructor() {
    this.currentShowingCard = this.deck.peelCard();
    this.incrementCurrentPlayersTurn();
  }

  incrementCurrentPlayersTurn() {
    if (
      this.currentPlayersTurn === null ||
      this.currentPlayersTurn === this.players.length - 1
    ) {
      // Wraps around if at the end
      this.currentPlayersTurn = 0;
      return;
    }
    this.currentPlayersTurn++;
  }

  getNextPlayer() {
    let nextPlayerIndex = 0;
    if (this.currentPlayersTurn !== this.players.length - 1) {
      nextPlayerIndex = this.currentPlayersTurn! + 1;
    }
    return this.players[nextPlayerIndex];
  }

  async gameStart() {
    await this.initializeGame();
    this.dealHands();
    while (!this.gameDetails.gameOver) {
      await this.iterateTurns();
    }
  }

  dealHands() {
    for (const player of this.players) {
      for (let i = 0; i < this.gameDetails.cardCount; i++) {
        player.receiveCard(this.deck.peelCard());
      }
    }
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayersTurn!];
  }

  private async requestCardInputFromPlayer(player: Player): Promise<string> {
    const cardCount = player.getCountOfCards();
    const inputPattern = new RegExp(`^([0-${cardCount - 1}]|p|,|\s)+$`);

    let validResponse = false;
    let response = "";
    while (!validResponse) {
      try {
        response = await this.getInput(
          "What card(s) would you like to play [enter index(s) of card with commas between] or p to pick up.",
          /^([0-9]|p|,|\s)+$/,
        );
      } catch {
        Logger.logColor(`Referee: That is not a valid answer.`, Colors.red);
        validResponse = false;
        continue;
      }
      response = response.replace(/\s+/g, "");
      if (response.length === 1 && response.toLowerCase() === "p") {
        validResponse = true;
        continue;
      } else if (/(\d,?)+/.test(response)) {
        // checks if comma seperated indexes are valid.
        const indexValues = response.split(",");
        let indexesAreCorrect = true;
        for (const index of indexValues) {
          if (Number(index) > cardCount - 1) {
            if (indexesAreCorrect) {
              indexesAreCorrect = false;
            }
          }
        }
        if (!indexesAreCorrect) {
          Logger.logColor(
            `Referee: The indexes only go up to ${cardCount -
              1} for this player.`,
            Colors.red,
          );
          validResponse = false;
          continue;
        }
      }
      validResponse = true;
    }
    return response;
  }

  private async implementCardConsequence(consequence: HandConsequence) {
    if (consequence !== HandConsequence.NONE) {
      switch (consequence) {
        case HandConsequence.CHANGE_SUIT:
          const suits = [Suit.CLUB, Suit.SPADE, Suit.HEART, Suit.DIAMOND];
          let validResponse = false;
          let response = "";
          while (!validResponse) {
            try {
              response = await this.getInput(
                "What suit would you like to change to? Clubs [0], Spades[1], Hearts [2], Diamonds [3]",
                /[1-4]/,
              );
              validResponse = true;
            } catch {
              Logger.logColor(
                "Referee: That is not a valid answer.",
                Colors.red,
              );
              validResponse = false;
            }
          }
          if (response) {
            response = response.replace(/\s+/g, "");
            this.currentShowingCard.changeSuit(suits[Number(response)]);
          }
          Logger.logColor(
            "Suit is now changed to " + suits[Number(response)],
            Colors.yellow,
          );
          break;

        case HandConsequence.PICK_UP_TWO:
          const nextPlayer = this.getNextPlayer();
          Logger.logColor(
            `${nextPlayer.getName()} must pick up two cards.`,
            Colors.yellow,
          );
          nextPlayer.receiveCard(this.deck.peelCard());
          nextPlayer.receiveCard(this.deck.peelCard());
          break;

        case HandConsequence.SKIP_A_GO:
          const skippedPlayer = this.getNextPlayer();
          Logger.logColor(
            `${skippedPlayer.getName()}'s go has been skipped.`,
            Colors.yellow,
          );
          this.incrementCurrentPlayersTurn();
          break;
      }
    }
  }

  async iterateTurns() {
    const currentPlayer = this.getCurrentPlayer();
    console.log("\n");
    Logger.logColor(`It is your go ${currentPlayer.getName()}`, Colors.yellow);
    Logger.logColor(
      `Current displayed card is ${this.currentShowingCard.displayName()}`,
    );

    currentPlayer.displayCards();
    const response = await this.requestCardInputFromPlayer(currentPlayer);

    if (response && response.toLowerCase() === "p") {
      Logger.logColor(
        `${currentPlayer.getName()} picked up a card.`,
        Colors.yellow,
      );
      currentPlayer.receiveCard(this.deck.peelCard());
      this.incrementCurrentPlayersTurn();
      return;
    }
    const cardsToPlayIndexes: number[] = response.split(",").map((cardIndex) =>
      Number(cardIndex)
    ).sort();
    for (let i = cardsToPlayIndexes.length - 1; i >= 0; i--) {
      currentPlayer.selectCard(cardsToPlayIndexes[i]);
    }
    const isValidHand = this.referee.validateHand(
      this.currentShowingCard,
      currentPlayer.getSelectedCards(),
    );
    if (!isValidHand) {
      if (currentPlayer.getSelectedCards().length === 1) {
        Logger.logColor(
          "Referee: You cannot play this card. Try again.",
          Colors.red,
        );
      } else {
        Logger.logColor(
          "Referee: You cannot play these cards. Try again.",
          Colors.red,
        );
      }
      currentPlayer.unselectAllCards();
      return;
    }

    const playedHand = currentPlayer.playHand();
    this.currentShowingCard = playedHand[playedHand.length - 1];
    Logger.logColor(
      `${currentPlayer.getName()} played ${
        playedHand.map((c) => c.displayName()).join(", ")
      }.`,
      Colors.yellow,
    );

    const consequence = this.referee.getHandConsequence(playedHand);
    await this.implementCardConsequence(consequence);

    this.incrementCurrentPlayersTurn();
  }

  async initializeGame() {
    let validResponse = false;
    let response = "";
    while (!validResponse) {
      try {
        response = await this.getInput(
          "Please enter the number of players for this game [1, 2, 3, 4]",
          /[1-4]/,
        );
        validResponse = true;
      } catch {
        Logger.logColor("Referee: That is not a valid answer.", Colors.red);
        validResponse = false;
      }
    }
    if (response) {
      this.gameDetails.playerCount = Number(response);
    }

    for (let i = 0; i < this.gameDetails.playerCount; i++) {
      this.players.push(new Player(i + 1));
    }

    validResponse = false;
    while (!validResponse) {
      try {
        response = await this.getInput(
          "Please enter the number of cards to start with [5, 6, 7, 8]",
          /[5-8]/,
        );
        validResponse = true;
      } catch {
        Logger.logColor("Referee: That is not a valid answer.", Colors.red);
        validResponse = false;
      }
    }
    if (response) {
      this.gameDetails.cardCount = Number(response);
    }
  }

  async getInput(
    message: string | null = null,
    allowedPattern?: RegExp,
  ): Promise<string> {
    if (message) {
      Logger.logColor(message);
    }
    const buf = new Uint8Array(1024);
    const n = await Deno.stdin.read(buf);
    const decoder = new TextDecoder("utf-8");
    let text = "";
    if (n !== null) {
      text += decoder.decode(buf.subarray(0, n));
    }
    text.replace(/\s+/g, "");
    if (allowedPattern) {
      if (!this.validateText(text, allowedPattern)) {
        throw Error("Character not allowed.");
      }
    }
    return text;
  }

  validateText(text: string, allowedPattern: RegExp) {
    return allowedPattern.test(text);
  }
}
