import _ from "lodash";
import "lodash.product";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day7.txt", "utf-8").split("\n"),
  _.isEmpty
);

// Part 1
const ranks: string[] = [
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

interface Hand {
  cards: string;
  bid: number;
}

const hands: Hand[] = lines.map((line) => {
  const [cards, bid] = line.split(" ");
  return { cards, bid: _.toNumber(bid) };
});

const handType = (hand: Hand): number => {
  const cards = hand.cards.split("");
  const countsCount = _.countBy(_.values(_.countBy(cards)));

  if (countsCount[5]) {
    return 1;
  }

  if (countsCount[4]) {
    return 2;
  }

  if (countsCount[3] && countsCount[2]) {
    return 3;
  }

  if (countsCount[3]) {
    return 4;
  }

  if (countsCount[2] === 2) {
    return 5;
  }

  if (countsCount[2]) {
    return 6;
  }

  return 7;
};

const compareHands = (h1: Hand, h2: Hand): number => {
  if (handType(h1) != handType(h2)) {
    return handType(h1) - handType(h2);
  }

  // Same type, so second ordering rule takes effect
  for (let i = 0; i < 5; i++) {
    const card1 = h1.cards[i];
    const card2 = h2.cards[i];

    if (ranks.indexOf(card1) != ranks.indexOf(card2)) {
      return ranks.indexOf(card1) - ranks.indexOf(card2);
    }
  }

  return 0;
};

hands.sort(compareHands);
hands.reverse();

console.log(_.sum(hands.map((hand, i) => hand.bid * (i + 1))));

// Part 2
const ranksWithJoker = [
  "A",
  "K",
  "Q",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
  "J",
];

// Take all ranks except the last one
const otherRanks = ranksWithJoker.slice(0, -1);

const bestHandPossible = (hand: Hand): number => {
  let best = Infinity;

  if (hand.cards.includes("J")) {
    const jokerIndices = _.range(5).filter((i) => hand.cards[i] === "J");
    const possibilities = _.times(jokerIndices.length, _.constant(otherRanks));

    _.product(...possibilities).forEach((assignment: string[]) => {
      const cards = hand.cards.split("");
      for (let j = 0; j < jokerIndices.length; j++) {
        cards[jokerIndices[j]] = assignment[j];
      }
      best = Math.min(best, handType({ cards: cards.join(""), bid: 0 }));
    });
  } else {
    best = handType(hand);
  }

  return best;
};

const compareHandsWithJoker = (h1: Hand, h2: Hand): number => {
  const bestH1 = bestHandPossible(h1);
  const bestH2 = bestHandPossible(h2);

  if (bestH1 != bestH2) {
    return bestH1 - bestH2;
  }

  // Same type, so second ordering rule takes effect
  for (let i = 0; i < 5; i++) {
    const card1 = h1.cards[i];
    const card2 = h2.cards[i];

    if (ranksWithJoker.indexOf(card1) != ranksWithJoker.indexOf(card2)) {
      return ranksWithJoker.indexOf(card1) - ranksWithJoker.indexOf(card2);
    }
  }

  return 0;
};

hands.sort(compareHandsWithJoker);
hands.reverse();

console.log(_.sum(hands.map((hand, i) => hand.bid * (i + 1))));
