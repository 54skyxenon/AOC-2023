import _ from "lodash";
import "lodash.product";
import fs from "fs";

const grid: string[] = _.reject(
  fs.readFileSync("inputs/day3.txt", "utf-8").split("\n"),
  _.isEmpty
);
const gridHeight = grid.length;
const gridWidth = grid[0].length;

const isSymbol = (char: string): boolean => {
  return !/^\d+$/.test(char) && char !== ".";
};

const gears: Record<number, number[]> = {};

// Part 1
const rowValue = (row: string, rowIndex: number): number => {
  // Match all numbers in the row via regex
  const matches: RegExpMatchArray[] = [...row.matchAll(/\d+/g)] || [];
  let rowSum: number = 0;

  matches.forEach((match) => {
    const matchIndex: number = match.index!;
    const matchLength: number = match[0].length;
    const matchValue: number = parseInt(match[0]);

    const indices = _.zip(
      _.times(matchLength, _.constant(rowIndex)),
      _.range(matchIndex, matchIndex + matchLength)
    ) as [number, number][];

    const adjIndices = _.flatten(
      indices.map(([r, c]) =>
        _.product([-1, 0, 1], [-1, 0, 1]).map(([dr, dc]) => [r + dr, c + dc])
      )
    ) as [number, number][];

    const nextToSymbol: boolean = adjIndices.some(([r, c]) => {
      if (!(0 <= r && r < gridHeight && 0 <= c && c < gridWidth)) {
        return false;
      }

      if (indices.includes([r, c])) {
        return false;
      }

      // Mark gears as adjacent to this number for part 2
      if (grid[r][c] === "*") {
        const gearHash = r * gridWidth + c;
        if (!gears[gearHash]) {
          gears[gearHash] = [];
        }
        gears[gearHash].push(matchValue);
      }

      return isSymbol(grid[r][c]);
    });

    if (nextToSymbol) {
      rowSum += matchValue;
    }
  });

  return rowSum;
};

console.log(_.sum(grid.map(rowValue)));

// Part 2
let gearProductSum = 0;

Object.entries(gears).forEach((gear) => {
  if (gear[1].length === 2) {
    gearProductSum += gear[1][0] * gear[1][1];
  }
});

console.log(gearProductSum);
