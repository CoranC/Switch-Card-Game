import { Suit, Rank } from "./enums.ts";

const toTitleCase = (text: string) => {
  return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
};

export default class Card {
  showing: boolean = false;
  selected: boolean = false;
  constructor(private suit: Suit, private rank: Rank) {}

  toggleSelect() {
    this.selected = !this.selected;
  }

  getRank() {
    return this.rank;
  }

  getSuit() {
    return this.suit;
  }

  show() {
    return `${this.rank} of ${this.suit}`;
  }

  displayName() {
    return `${toTitleCase(this.rank.toString())} of ${
      toTitleCase(this.suit.toString())
    }s`;
  }

  changeSuit(suit: Suit) {
    this.suit = suit;
  }
}
