import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day18.txt", "utf-8").split("\n"),
  _.isEmpty
);

// up (U), down (D), left (L), or right (R)
enum Direction {
  Up = "U",
  Down = "D",
  Left = "L",
  Right = "R",
}

const adjacent: [number, number, Direction][] = [
  [0, 1, Direction.Right],
  [1, 0, Direction.Down],
  [0, -1, Direction.Left],
  [-1, 0, Direction.Up],
];

const pointsP1: [number, number][] = [[0, 0]];
const pointsP2: [number, number][] = [[0, 0]];

lines.forEach((line) => {
  const [direction, stepsStr, _rgb] = line.split(" ");
  const [x, y] = _.last(pointsP1)!;
  const [dr, dc, _d] = _.find(adjacent, (a) => a[2] === direction)!;
  const distance = parseInt(stepsStr, 10);

  pointsP1.push([x + dc * distance, y - dr * distance]);
});

lines.forEach((line) => {
  const [_direction, _stepsStr, rgb] = line.split(" ");
  const digits = rgb.slice(2, rgb.length - 1).split("");
  const distance = parseInt(digits.slice(0, 5).join(""), 16);
  const direction = parseInt(digits[5]);
  const [x, y] = _.last(pointsP2)!;
  const [dr, dc, _d] = adjacent[direction];

  pointsP2.push([x + dc * distance, y - dr * distance]);
});

/**
 * Find the area of the polygon formed by the points using the Shoelace formula.
 * ! And don't forget the border of the grid itself...
 */
const calculateArea = (points: [number, number][]): number => {
  let area = 0;
  let totalTraveled = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    area += x1 * y2 - x2 * y1;
    totalTraveled += Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  const shoelace = Math.abs(area) / 2;
  const border = Math.ceil((totalTraveled + 1) / 2);

  return shoelace + border;
};

// Part 1
console.log(calculateArea(pointsP1));

// Part 2
console.log(calculateArea(pointsP2));
