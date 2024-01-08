import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day6.txt", "utf-8").split("\n"),
  _.isEmpty
);

const times: number[] = lines[0]
  .split(": ")[1]
  .split(" ")
  .filter((t) => !_.isEmpty(t))
  .map((t) => _.toNumber(t));

const distances: number[] = lines[1]
  .split(": ")[1]
  .split(" ")
  .filter((d) => !_.isEmpty(d))
  .map((d) => _.toNumber(d));

const waysToBeat = (t: number, d: number): number => {
  let ways: number = 0;

  for (let hold = 0; hold <= t; hold++) {
    const remaining: number = t - hold;
    if (remaining * hold > d) {
      ways++;
    }
  }

  return ways;
};

// Part 1
const eachWay = _.zip(times, distances).map(([t, d]) => waysToBeat(t!, d!));
console.log(_.reduce(eachWay, _.multiply, 1));

// Part 2
const timeSingular = _.toNumber(times.map((t) => t.toString()).join(""));
const distanceSingular = _.toNumber(
  distances.map((d) => d.toString()).join("")
);
console.log(waysToBeat(timeSingular, distanceSingular));
