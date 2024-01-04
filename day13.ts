import _ from "lodash";
import "lodash.product";
import fs from "fs";

const lines: string[] = fs
  .readFileSync("inputs/day13.txt", "utf-8")
  .split("\n");

const rotate = (grid: string[]): string[] =>
  _.zip(...grid.map((row) => Array.from(row))).map((row) => row.join(""));

const mirrors: string[][] = _.reduce(
  lines,
  (result: string[][], value: string) => {
    if (value !== "") {
      result[result.length - 1].push(value);
    } else if (result[result.length - 1].length > 0) {
      result.push([]);
    }
    return result;
  },
  [[]]
);

// Check if the current line between is a valid reflection
const validReflection = (mirror: string[], betweenIndex: number): boolean => {
  let left = betweenIndex;
  let right = betweenIndex + 1;

  while (left >= 0 && right < mirror.length) {
    if (mirror[left] === mirror[right]) {
      left--;
      right++;
    } else {
      return false;
    }
  }

  return true;
};

// For the current orientation, find the reflection if it exists
const getReflection = (mirror: string[], banned: number = -1): number => {
  for (let pivot = 0; pivot < mirror.length - 1; pivot++) {
    // Has to be NEW
    if (pivot === banned) {
      continue;
    }

    if (validReflection(mirror, pivot)) {
      return pivot + 1;
    }
  }

  return 0;
};

// Reflections of the current mirror vertically and horizontally
const bothReflections = (mirror: string[]): [number, number] => {
  const rowReflection = getReflection(mirror);
  const colReflection = getReflection(rotate(mirror));
  return [rowReflection, colReflection];
};

/**
 * Helped by: https://www.youtube.com/watch?v=Jzp8INWz5Z0
 * Since I can't read
 */
const fixSmudge = (mirror: string[]): number => {
  const oldReflection = bothReflections(mirror);

  for (let row = 0; row < mirror.length; row++) {
    for (let col = 0; col < mirror[0].length; col++) {
      const newMirror = _.cloneDeep(mirror);
      const newMirrorRow = Array.from(mirror[row]);
      newMirrorRow[col] = newMirrorRow[col] === "." ? "#" : ".";
      newMirror[row] = newMirrorRow.join("");

      const newRowReflection = getReflection(newMirror, oldReflection[0] - 1);
      const newColReflection = getReflection(
        rotate(newMirror),
        oldReflection[1] - 1
      );

      const newReflection = [newRowReflection, newColReflection];

      // Should have a reflection and not be the same as the old reflection
      if (
        !_.isEqual(newReflection, [0, 0]) &&
        !_.isEqual(newReflection, oldReflection)
      ) {
        return 100 * newReflection[0] + newReflection[1];
      }
    }
  }

  throw new Error("No smudge found");
};

// Part 1
console.log(
  _.sum(
    mirrors.map((mirror) => {
      const [rowReflection, colReflection] = bothReflections(mirror);
      return 100 * rowReflection + colReflection;
    })
  )
);

// Part 2
console.log(_.sum(mirrors.map(fixSmudge)));
