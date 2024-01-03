import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day12.txt", "utf-8").split("\n"),
  _.isEmpty
);

const solve = (sequence: string[], pattern: number[]): number => {
  const cache: Record<string, number> = {};

  const dp = (
    pathIndex: number,
    streak: number,
    patternIndex: number
  ): number => {
    const cacheKey = `${pathIndex}-${streak}-${patternIndex}`;

    const compute = (): number => {
      if (pathIndex === sequence.length) {
        if (patternIndex === pattern.length) {
          return streak === 0 ? 1 : 0;
        }

        return patternIndex === pattern.length - 1 &&
          pattern[patternIndex] === streak
          ? 1
          : 0;
      }

      const current = sequence[pathIndex];

      // Either we have no streak or the streak we end is the same as the pattern
      const breakingStreakValid =
        streak === 0 ||
        (patternIndex < pattern.length && pattern[patternIndex] === streak);

      if (current === "#") {
        return dp(pathIndex + 1, streak + 1, patternIndex);
      } else if (current === ".") {
        // End the streak
        if (!breakingStreakValid) {
          return 0;
        }

        return dp(pathIndex + 1, 0, patternIndex + (streak > 0 ? 1 : 0));
      } else {
        // current === "?"
        let possibilities = dp(pathIndex + 1, streak + 1, patternIndex);

        // We can end the streak if we're at the end of the pattern
        if (breakingStreakValid) {
          possibilities += dp(
            pathIndex + 1,
            0,
            patternIndex + (streak > 0 ? 1 : 0)
          );
        }

        return possibilities;
      }
    };

    if (!(cacheKey in cache)) {
      cache[cacheKey] = compute();
    }

    return cache[cacheKey];
  };

  return dp(0, 0, 0);
};

// Part 1
const getSprings = (line: string): string[] => Array.from(line.split(" ")[0]);

const getPattern = (line: string): number[] =>
  line
    .split(" ")[1]
    .split(",")
    .map((x) => Number(x));

console.log(
  _.sum(lines.map((line) => solve(getSprings(line), getPattern(line))))
);

// Part 2
const repeatSprings = (springs: string, times: number): string[] =>
  Array.from(
    _.range(times)
      .map(() => springs)
      .join("?")
  );

const repeatPattern = (pattern: number[], times: number): number[] =>
  _.range(times)
    .map(() => pattern)
    .flat();

console.log(
  _.sum(
    lines.map((line) =>
      solve(
        repeatSprings(getSprings(line).join(""), 5),
        repeatPattern(getPattern(line), 5)
      )
    )
  )
);
