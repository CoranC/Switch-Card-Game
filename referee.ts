import Card from "./card.ts";
import { HandConsequence, Rank } from "./enums.ts";

export default class Referee {
  commonCardCheck(faceCard: Card, playedCard: Card) {
    return faceCard.getRank() === playedCard.getRank() ||
      faceCard.getSuit() === playedCard.getSuit();
  }

  validateHand(currentShowingCard: Card, cards: Card[]) {
    let isValid = false;
    if (cards.length === 1) {
      if (cards[0].getRank() === Rank.ACE) return true;
      return this.commonCardCheck(currentShowingCard, cards[0]);
    }
    for (let i = 0; i < cards.length; i++) {
      if (i === 0) {
        if (cards[0].getRank() === Rank.ACE) {
          isValid = true;
          continue;
        }
        isValid = this.commonCardCheck(currentShowingCard, cards[i]);
      } else {
        isValid = cards[i - 1].getRank() === cards[i].getRank();
      }
      if (!isValid) {
        return false;
      }
    }
    return true;
  }

  getHandConsequence(cards: Card[]): HandConsequence {
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].getRank() === Rank.ACE) {
        return HandConsequence.CHANGE_SUIT;
      }
      if (cards[i].getRank() === Rank.TWO) {
        return HandConsequence.PICK_UP_TWO;
      }
      if (cards[i].getRank() === Rank.EIGHT) {
        return HandConsequence.SKIP_A_GO;
      }
    }
    return HandConsequence.NONE;
  }
}
