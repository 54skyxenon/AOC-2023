import _ from "lodash";
import "lodash.product";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day23.txt", "utf-8").split("\n"),
  _.isEmpty
);

const startRow = 0;
const startCol = lines[0].split("").findIndex((c) => c === ".");

const endRow = lines.length - 1;
const endCol = lines[endRow].split("").findIndex((c) => c === ".");

// const longestPath = (
//   startRow: number,
//   startCol: number,
//   endRow: number,
//   endCol: number
// ): number => {
//   const distanceToEnd = (row: number, col: number): number => {
//     return Math.abs(row - endRow) + Math.abs(col - endCol);
//   };

//   const states = _.product(
//     _.range(lines.length),
//     _.range(lines[0].length),
//     _.range(lines.length),
//     _.range(lines[0].length)
//   ).filter(
//     ([row, col, fromRow, fromCol]) =>
//       !(row === startRow && col === startCol) &&
//       Math.abs(row - fromRow) + Math.abs(col - fromCol) === 1
//   );

//   const dp = _.times(lines.length, () =>
//     _.times(lines[0].length, () => new Map<string, number>())
//   );

//   states.sort((a, b) => distanceToEnd(a[0], a[1]) - distanceToEnd(b[0], b[1]));
//   states.push([startRow, startCol, -1, -1]);

//   const adjacent = [
//     [-1, 0],
//     [1, 0],
//     [0, -1],
//     [0, 1],
//   ];

//   const policy: Record<string, number[]> = {
//     "^": [-1, 0],
//     ">": [0, 1],
//     v: [1, 0],
//     "<": [0, -1],
//   };

//   states.forEach(([row, col, fromRow, fromCol]) => {
//     if (fromRow >= 0 && fromCol >= 0 && lines[fromRow][fromCol] === "#") {
//       return;
//     }

//     const fromState = `${fromRow},${fromCol}`;

//     if (row === endRow && col === endCol) {
//       dp[row][col].set(fromState, 0);
//       return;
//     }

//     let opt = 0;

//     adjacent.forEach(([dr, dc]) => {
//       const required = policy[lines[row][col]];

//       if (required && !_.isEqual([dr, dc], required)) {
//         return;
//       }

//       if (
//         row + dr < 0 ||
//         row + dr >= lines.length ||
//         col + dc < 0 ||
//         col + dc >= lines[0].length ||
//         (row + dr === fromRow && col + dc === fromCol) ||
//         lines[row + dr][col + dc] === "#"
//       ) {
//         return;
//       }

//       const adjFromState = `${row},${col}`;

//       opt = Math.max(
//         opt,
//         1 + (dp[row + dr][col + dc].get(adjFromState) || Number.MIN_VALUE)
//       );
//     });

//     dp[row][col].set(fromState, opt);
//   });

//   return dp[startRow][startCol].get(`-1,-1`)!;

//   // Valid stack overflow solution below:

//   // const adjacent = [
//   //   [-1, 0],
//   //   [1, 0],
//   //   [0, -1],
//   //   [0, 1],
//   // ];

//   // const cache = new Map<string, number>();

//   // const policy: Record<string, number[]> = {
//   //   "^": [-1, 0],
//   //   ">": [0, 1],
//   //   v: [1, 0],
//   //   "<": [0, -1],
//   // };

//   // const compute = (
//   //   row: number,
//   //   col: number,
//   //   fromRow: number,
//   //   fromCol: number
//   // ): number => {
//   //   if (row === endRow && col === endCol) {
//   //     return 0;
//   //   }
//   //   let opt = 0;
//   //   adjacent.forEach(([dr, dc]) => {
//   //     const required = policy[lines[row][col]];
//   //     if (required && !_.isEqual([dr, dc], required)) {
//   //       return;
//   //     }
//   //     if (
//   //       row + dr < 0 ||
//   //       row + dr >= lines.length ||
//   //       col + dc < 0 ||
//   //       col + dc >= lines[0].length ||
//   //       (row + dr === fromRow && col + dc === fromCol) ||
//   //       lines[row + dr][col + dc] === "#"
//   //     ) {
//   //       return;
//   //     }
//   //     opt = Math.max(opt, 1 + dp(row + dr, col + dc, row, col));
//   //   });
//   //   return opt;
//   // };

//   // const dp = (
//   //   row: number,
//   //   col: number,
//   //   fromRow: number,
//   //   fromCol: number
//   // ): number => {
//   //   const cacheKey = `${row},${col},${fromRow},${fromCol}`;

//   //   if (cache.has(cacheKey)) {
//   //     return cache.get(cacheKey)!;
//   //   }

//   //   const result = compute(row, col, fromRow, fromCol);

//   //   cache.set(cacheKey, result);

//   //   return result;
//   // };

//   // return dp(startRow, startCol, -1, -1);
// };

const adjacent = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const policy: Record<string, number[]> = {
  "^": [-1, 0],
  ">": [0, 1],
  v: [1, 0],
  "<": [0, -1],
};

const height = lines.length;
const width = lines[0].length;

const dfs = (row: number, col: number, path: Set<number>): number => {
  if (row === endRow && col === endCol) {
    return 0;
  }

  let opt = 0;

  adjacent.forEach(([dr, dc]) => {
    const neighborId = (row + dr) * width + (col + dc);
    const required = policy[lines[row][col]];

    if (
      row + dr < 0 ||
      row + dr >= height ||
      col + dc < 0 ||
      col + dc >= width ||
      (required && !_.isEqual([dr, dc], required)) ||
      path.has(neighborId) ||
      lines[row + dr][col + dc] === "#"
    ) {
      return;
    }

    path.add(neighborId);
    opt = Math.max(opt, 1 + dfs(row + dr, col + dc, path));
    path.delete(neighborId);
  });

  return opt;
};

// Part 1
console.log(
  dfs(startRow, startCol, new Set<number>([startRow * width + startCol]))
);
