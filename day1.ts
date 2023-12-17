import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day1.txt", "utf-8").split("\n"),
  _.isEmpty
);

// Part 1
const getCalibrationPart1 = (line: string): number => {
  // Extract only digits from the line, map to numbers
  const digits: number[] = _.reduce(
    line.split(""),
    (acc: number[], char: string): number[] => {
      if (_.isFinite(_.toNumber(char))) {
        return [...acc, _.toNumber(char)];
      }
      return acc;
    },
    []
  );

  // Take the first and last digits, combine to form a two-digit number
  return 10 * digits[0] + digits[digits.length - 1];
};

console.log(_.sum(lines.map(getCalibrationPart1)));

// Part 2
const wordToDigit: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

const regex = /(one|two|three|four|five|six|seven|eight|nine|\d)/g;

const getCalibrationPart2 = (line: string): number => {
  // Extract both digits and word numbers from the line now
  const matches: string[] = line.match(regex) ?? [];
  const digits: number[] = _.reduce(
    matches,
    (acc: number[], match: string): number[] => {
      const conversion: number = wordToDigit[match] ?? _.toNumber(match);
      return [...acc, conversion];
    },
    []
  );

  return 10 * digits[0] + digits[digits.length - 1];
};

console.log(_.sum(lines.map(getCalibrationPart2)));
