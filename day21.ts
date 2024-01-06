import _ from "lodash";
import "lodash.product";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day21.txt", "utf-8").split("\n"),
  _.isEmpty
);

const solveBfs = (limit: number) => {
  const height = lines.length;
  const width = lines[0].length;

  const adjacent: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const visited: number[][][] = _.times(height, () =>
    _.times(width, () => _.times(limit + 1, _.constant(0)))
  );

  const [startingRow, startingCol] = _.find(
    _.product(_.range(0, height), _.range(0, width)),
    ([row, col]) => lines[row][col] === "S"
  )!;

  visited[startingRow][startingCol][0] = 1;
  const queue: [number, number, number][] = [[startingRow, startingCol, 0]];

  while (queue.length > 0) {
    const [r, c, depth] = queue.shift()!;

    adjacent.forEach(([dr, dc]) => {
      const [nr, nc] = [r + dr, c + dc];
      if (
        nr < 0 ||
        nr >= height ||
        nc < 0 ||
        nc >= width ||
        lines[nr][nc] === "#" ||
        depth + 1 > limit ||
        visited[nr][nc][depth + 1] === 1
      ) {
        return;
      }

      visited[nr][nc][depth + 1] = 1;
      queue.push([nr, nc, depth + 1]);
    });
  }

  return _.sum(
    _.product(_.range(0, height), _.range(0, width)).map(
      ([row, col]) => visited[row][col][limit]
    )
  );
};

console.log(solveBfs(64));

const advanceStep = (captured: number[], goodMods: Set<number>): number[] => {
  const height = lines.length;
  const width = lines[0].length;
  const totalCells = height * width;
  const adjacent: number[] = [-1, 1, -width, width];
  const newCaptured = new Set<number>();

  for (const cell of captured) {
    adjacent.forEach((adj) => {
      const newCell = (cell + adj + totalCells) % totalCells;

      if (goodMods.has(newCell)) {
        newCaptured.add(newCell);
      }
    });
  }

  return Array.from(newCaptured);
};

/**
 * Optimization ideas: map each cell to a 2d cell and create a mod system from that!
 */
const solveMod = (limit: number) => {
  const height = lines.length;
  const width = lines[0].length;
  const flattened = Array.from(lines.join(""));

  const goodMods: Set<number> = new Set();

  const [startingRow, startingCol] = _.find(
    _.product(_.range(0, height), _.range(0, width)),
    ([row, col]) => lines[row][col] === "S"
  )!;

  flattened.forEach((c, i) => {
    if (c !== "#") {
      goodMods.add(i);
    }
  });

  let captured = [startingRow * width + startingCol];

  for (let i = 0; i < limit; i++) {
    captured = advanceStep(captured, goodMods);
  }

  console.log(captured);

  return captured;
};

solveMod(10);
