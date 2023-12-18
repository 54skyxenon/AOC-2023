import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day8.txt", "utf-8").split("\n"),
  _.isEmpty
);

const movements: string = lines[0];
const graph: Record<string, string[]> = {};

lines.slice(1).forEach((line) => {
  const [parent, children] = line.split(" = ");
  const [left, right] = children.slice(1, -1).split(", ");
  graph[parent] = [left, right];
});

// Part 1
const stepsNeeded = (): number => {
  let steps: number = 0;
  let location: string = "AAA";

  while (location !== "ZZZ") {
    if (movements[steps % movements.length] === "L") {
      location = graph[location][0];
    } else {
      location = graph[location][1];
    }
    steps++;
  }

  return steps;
};

console.log(stepsNeeded());

// Part 2
const gcd = (a: number, b: number): number => {
  if (a === 0) {
    return b;
  }
  return gcd(b % a, a);
};

const lcm = (a: number, b: number): number => {
  return (a * b) / gcd(a, b);
};

const stepsNeededAll = (): number => {
  let locations: string[] = Object.keys(graph).filter((key) =>
    key.endsWith("A")
  );
  let steps: number[] = _.times(locations.length, _.constant(0));

  while (locations.some((location) => !location.endsWith("Z"))) {
    locations.forEach((location, i) => {
      if (location.endsWith("Z")) {
        return;
      }
      if (movements[steps[i] % movements.length] === "L") {
        locations[i] = graph[location][0];
      } else {
        locations[i] = graph[location][1];
      }
      steps[i]++;
    });
  }

  // Take LCM of all steps
  return _.reduce(steps, lcm, 1);
};

console.log(stepsNeededAll());
