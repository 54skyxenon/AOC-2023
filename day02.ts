import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day2.txt", "utf-8").split("\n"),
  _.isEmpty
);

type Color = "red" | "green" | "blue";
type ColorCountMap = Record<Color, number>;

const getMaxCounts = (subsets: string): ColorCountMap => {
  const baseCounts: ColorCountMap = {
    red: 0,
    green: 0,
    blue: 0,
  };

  return _.reduce(
    subsets.split("; "),
    (acc: ColorCountMap, subset: string) => {
      subset.split(", ").forEach((cube) => {
        const [count, color] = cube.split(" ");
        acc[color as Color] = Math.max(acc[color as Color], _.toNumber(count));
      });

      return acc;
    },
    baseCounts
  );
};

// Part 1
const gameValue = (line: string): number => {
  const [game, subsets] = line.split(": ");
  const gameId = _.toNumber(game.split(" ")[1]);
  const maxCounts = getMaxCounts(subsets);

  if (maxCounts.red > 12 || maxCounts.green > 13 || maxCounts.blue > 14) {
    return 0;
  }

  return gameId;
};

console.log(_.sum(lines.map(gameValue)));

// Part 2
const gamePower = (line: string): number => {
  const subsets = line.split(": ")[1];
  const maxCounts = getMaxCounts(subsets);
  return maxCounts.red * maxCounts.green * maxCounts.blue;
};

console.log(_.sum(lines.map(gamePower)));
