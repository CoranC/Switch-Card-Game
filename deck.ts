import Card from './card.ts';
import {Suit, Rank} from './enums.ts';

export default class Deck {
  cards!: Card[];

  constructor(){
    this.createNewDeckOfCards();
  }

  createNewDeckOfCards() {
    this.createCards();
    this.shuffleCards();
  }

  emptyDeck(){
    return !this.cards.length;
  }

  peelCard(){
    if(this.emptyDeck()){
      this.createNewDeckOfCards()
    }
    return this.cards.pop()!;
  }

  private createCards(){
    const suits = Object.keys(Suit);
    const ranks = Object.values(Rank);
    const cards: Card[] = [];
    for(const suit of suits){
      for(const rank of ranks){
        cards.push(new Card(suit as Suit, rank as Rank));
      }
    }
    this.cards = cards;
  }

  private shuffleCards(){
    for (var i = this.cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = this.cards[i];
      this.cards[i] = this.cards[j];
      this.cards[j] = temp;
    }
  }
}