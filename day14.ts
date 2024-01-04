import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day14.txt", "utf-8").split("\n"),
  _.isEmpty
);

const rotate = (grid: string[]): string[] =>
  _.zip(...grid.map((row) => row.split(""))).map((row) => row.join(""));

const rotateReverse = (grid: string[]): string[] =>
  rotate(rotate(rotate(grid)));

const strReverse = (str: string): string => str.split("").reverse().join("");

// Shift all 'O' left until blocked by '#' or string left bound
const slide = (row: string): string => {
  const segments: string[][] = [[]];

  Array.from(row).forEach((char) => {
    if (char === "#") {
      segments.push([char]);
      segments.push([]);
    } else {
      segments[segments.length - 1].push(char);
    }
  });

  return _.flatten(
    segments.map((segment) => _.sortBy(segment, (c) => c === "."))
  ).join("");
};

// Simulate a full rotation cycle for part 2
const rotationCycle = (grid: string[]): string[] => {
  // Rotate North
  let newGrid = rotateReverse(rotate(grid).map(slide));

  // Rotate West
  newGrid = newGrid.map(slide);

  // Rotate South
  newGrid = rotate(
    rotateReverse(newGrid).map(strReverse).map(slide).map(strReverse)
  );

  // Rotate East
  newGrid = newGrid.map(strReverse).map(slide).map(strReverse);

  return newGrid;
};

// How far in total is every 'O' from the end of the string?
const totalLoad = (grid: string[]): number =>
  _.sum(
    grid.map((row) =>
      _.sum(
        row
          .split("")
          .map((char, index) => (char === "O" ? row.length - index : 0))
      )
    )
  );

// Find the total North load of the grid after numCycles cycles
const evaluateCycles = (lines: string[], numCycles: number): number => {
  const cycle = [];
  const seenAt: Record<string, number> = {};

  let currentGrid = _.cloneDeep(lines);
  let i = 0;

  while (true) {
    currentGrid = rotationCycle(currentGrid);
    const hash = currentGrid.join("");

    if (seenAt[hash]) {
      cycle.splice(0, seenAt[hash]);
      return cycle[(numCycles - seenAt[hash] - 1) % cycle.length];
    } else {
      seenAt[hash] = i;
    }

    cycle.push(totalLoad(rotate(currentGrid)));
    i++;
  }
};

// Part 1
console.log(totalLoad(rotate(lines).map(slide)));

// Part 2
console.log(evaluateCycles(lines, 1000000000));
