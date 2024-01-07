import _, { Dictionary } from "lodash";
import "lodash.product";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day23.txt", "utf-8").split("\n"),
  _.isEmpty
);

const height = lines.length;
const width = lines[0].length;

const startRow = 0;
const startCol = lines[0].split("").findIndex((c) => c === ".");
const endRow = height - 1;
const endCol = lines[endRow].split("").findIndex((c) => c === ".");

const adjacent: [number, number][] = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const policy: Dictionary<number[]> = _.zipObject(
  ["^", "v", "<", ">"],
  adjacent
);

const part1 = (): number => {
  // Represent visited cells as a single number to avoid set lookup comparison ambiguity
  const dfs = (row: number, col: number, visited: Set<number>): number => {
    if (row === endRow && col === endCol) {
      return 0;
    }

    let ans = 0;

    adjacent.forEach(([dr, dc]) => {
      const neighborId = (row + dr) * width + (col + dc);
      const required = policy[lines[row][col]];

      if (
        row + dr < 0 ||
        row + dr >= height ||
        col + dc < 0 ||
        col + dc >= width ||
        (required && !_.isEqual([dr, dc], required)) ||
        visited.has(neighborId) ||
        lines[row + dr][col + dc] === "#"
      ) {
        return;
      }

      visited.add(neighborId);
      ans = Math.max(ans, 1 + dfs(row + dr, col + dc, visited));
      visited.delete(neighborId);
    });

    return ans;
  };

  return dfs(
    startRow,
    startCol,
    new Set<number>([startRow * width + startCol])
  );
};

const part2 = (): number => {
  // Start, end, or >= 3 adjacent neighbors
  const crossroads = _.product(_.range(height), _.range(width)).filter(
    ([r, c]) =>
      lines[r][c] === "." &&
      ((r === startRow && c === startCol) ||
        (r === endRow && c === endCol) ||
        adjacent.filter(
          ([dr, dc]) =>
            r + dr >= 0 &&
            r + dr < height &&
            c + dc >= 0 &&
            c + dc < width &&
            lines[r + dr][c + dc] !== "#"
        ).length >= 3)
  );

  const compressedGraph: [number, number, number][][] = _.times(
    crossroads.length,
    () => []
  );

  // BFS until you hit another crossroads
  crossroads.forEach(([r, c], i) => {
    const visited = new Set<number>([r * width + c]);
    const queue = [[r, c, 0]];

    while (queue.length > 0) {
      const [row, col, depth] = queue.shift()!;

      adjacent.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        const neighborId = nr * width + nc;

        if (
          nr < 0 ||
          nr >= height ||
          nc < 0 ||
          nc >= width ||
          lines[nr][nc] === "#" ||
          visited.has(neighborId)
        ) {
          return;
        }

        if (
          crossroads.some(([otherR, otherC]) => otherR === nr && otherC === nc)
        ) {
          compressedGraph[i].push([nr, nc, depth + 1]);
          return;
        }

        visited.add(neighborId);
        queue.push([nr, nc, depth + 1]);
      });
    }
  });

  // Represent visited cells as a single number to avoid set lookup comparison ambiguity
  const dfs = (r: number, c: number, visited: Set<number>): number => {
    if (r === endRow && c === endCol) {
      return 0;
    }

    // ! Number.MIN_VALUE or 0 may overcount if all child paths fail, -Infinity is safer
    let ans = -Infinity;

    const crossroadsIndex = crossroads.findIndex(
      ([otherR, otherC]) => otherR === r && otherC === c
    )!;

    compressedGraph[crossroadsIndex].forEach(([nr, nc, cost]) => {
      const neighborId = nr * width + nc;
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        ans = Math.max(ans, cost + dfs(nr, nc, visited));
        visited.delete(neighborId);
      }
    });

    return ans;
  };

  return dfs(
    startRow,
    startCol,
    new Set<number>([startRow * width + startCol])
  );
};

// Part 1
console.log(part1());

// Part 2
console.log(part2());
