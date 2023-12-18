import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day9.txt", "utf-8").split("\n"),
  _.isEmpty
);

const getDifferencesPyramid = (line: string): number[][] => {
  const pyramid: number[][] = [line.split(" ").map(Number)];
  while (pyramid[pyramid.length - 1].some((x) => x !== 0)) {
    const nextRow: number[] = [];

    for (let i = 0; i < pyramid[pyramid.length - 1].length - 1; i++) {
      nextRow.push(
        pyramid[pyramid.length - 1][i + 1] - pyramid[pyramid.length - 1][i]
      );
    }

    pyramid.push(nextRow);
  }

  return pyramid;
};

// Part 1
const extrapolationSum = (line: string): number => {
  const pyramid: number[][] = getDifferencesPyramid(line);

  for (let i = pyramid.length - 1; i >= 0; i--) {
    if (i === pyramid.length - 1) {
      pyramid[i].push(0);
      continue;
    }

    pyramid[i].push(
      pyramid[i][pyramid[i].length - 1] +
        pyramid[i + 1][pyramid[i + 1].length - 1]
    );
  }

  return pyramid[0][pyramid[0].length - 1];
};

console.log(_.sum(lines.map(extrapolationSum)));

// Part 2
const extrapolationSumBeginning = (line: string): number => {
  const pyramid: number[][] = getDifferencesPyramid(line);

  for (let i = pyramid.length - 1; i >= 0; i--) {
    if (i === pyramid.length - 1) {
      pyramid[i].unshift(0);
      continue;
    }

    pyramid[i].unshift(pyramid[i][0] - pyramid[i + 1][0]);
  }

  return pyramid[0][0];
};

console.log(_.sum(lines.map(extrapolationSumBeginning)));
