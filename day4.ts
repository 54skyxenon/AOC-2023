import _ from "lodash";
import fs from "fs";

const cards: string[] = _.reject(
  fs.readFileSync("inputs/day4.txt", "utf-8").split("\n"),
  _.isEmpty
);

const numMatching = (card: string): number => {
  const numbers = card.split(": ")[1];
  const [winning, yours] = numbers
    .split(" | ")
    .map((side) => _.reject(side.split(" "), _.isEmpty));

  return _.intersection(winning, yours).length;
};

// Part 1
const cardPointValue = (card: string): number => {
  const both = numMatching(card);

  if (both === 0) {
    return 0;
  }

  return Math.pow(2, both - 1);
};

console.log(_.sum(cards.map(cardPointValue)));

// Part 2
const getTotalCopies = (): number => {
  const counts = _.times(cards.length, _.constant(1));

  cards.forEach((card, i) => {
    const both = numMatching(card);

    for (let j = i + 1; j < Math.min(cards.length, i + 1 + both); j++) {
      counts[j] += counts[i];
    }
  });

  return _.sum(counts);
};

console.log(getTotalCopies());
