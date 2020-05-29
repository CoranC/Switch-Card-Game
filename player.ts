import Logger from "./logger.ts";
import Card from "./card.ts";

export default class Player {
  private cards: Card[] = [];

  constructor(private id: number) {}

  getId() {
    return this.id;
  }

  getName() {
    return `Player ${this.id}`;
  }

  playHand() {
    const handToPlay = this.cards.filter((card) => card.selected);
    const remainingCards = this.cards.filter((card) => !card.selected);
    this.cards = remainingCards;
    return handToPlay;
  }

  getSelectedCards() {
    return this.cards.filter((card) => card.selected);
  }

  displayCards() {
    Logger.logPlayerTable(
      this.cards.map((card) => card.displayName()),
      this.id,
    );
  }

  getCountOfCards() {
    return this.cards.length;
  }

  selectCard(cardIndex: number) {
    this.toggleSelectedCard(cardIndex, true);
  }

  unselectCard(cardIndex: number) {
    this.toggleSelectedCard(cardIndex, false);
  }

  unselectAllCards() {
    this.cards.forEach((card: Card) => {
      card.selected = false;
    });
  }

  private toggleSelectedCard(cardIndex: number, selected: boolean) {
    this.cards[cardIndex].selected = selected;
  }

  receiveCard(card: Card) {
    this.cards.push(card);
  }
}
