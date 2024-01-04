import _ from "lodash";
import fs from "fs";

const grid: string[] = _.reject(
  fs.readFileSync("inputs/day16.txt", "utf-8").split("\n"),
  _.isEmpty
);

enum Direction {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

enum Cell {
  Empty = ".",
  MirrorLeft = "/",
  MirrorRight = "\\",
  SplitterHorizontal = "-",
  SplitterVertical = "|",
}

const height = grid.length;
const width = grid[0].length;

const adjacent: [number, number, number][] = [
  [-1, 0, Direction.North],
  [0, 1, Direction.East],
  [1, 0, Direction.South],
  [0, -1, Direction.West],
];

const visited: boolean[][][] = _.times(height, () =>
  _.times(width, () => [false, false, false, false])
);

const countVisited = (): number =>
  _.sum(
    visited.map((row) =>
      _.sum(row.map((column) => column.some((d) => d === true)))
    )
  );

const clearVisited = (): void => {
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      for (let direction = 0; direction < 4; direction++) {
        visited[row][column][direction] = false;
      }
    }
  }
};

const dfs = (row: number, column: number, direction: Direction): void => {
  if (row < 0 || row >= height || column < 0 || column >= width) {
    return;
  }

  if (visited[row][column][direction]) {
    return;
  }

  visited[row][column][direction] = true;

  switch (grid[row][column]) {
    case Cell.Empty: {
      const [dr, dc, _] = adjacent.find(([_dr, _dc, d]) => d === direction)!;
      dfs(row + dr, column + dc, direction);
      break;
    }
    case Cell.MirrorLeft: {
      const mapping: Record<Direction, Direction> = {
        [Direction.North]: Direction.East,
        [Direction.East]: Direction.North,
        [Direction.South]: Direction.West,
        [Direction.West]: Direction.South,
      };

      const [dr, dc, newD] = adjacent.find(
        ([_dr, _dc, d]) => d === mapping[direction]
      )!;

      dfs(row + dr, column + dc, newD);
      break;
    }
    case Cell.MirrorRight: {
      const mapping: Record<Direction, Direction> = {
        [Direction.North]: Direction.West,
        [Direction.East]: Direction.South,
        [Direction.South]: Direction.East,
        [Direction.West]: Direction.North,
      };

      const [dr, dc, newD] = adjacent.find(
        ([_dr, _dc, d]) => d === mapping[direction]
      )!;

      dfs(row + dr, column + dc, newD);
      break;
    }
    case Cell.SplitterHorizontal: {
      if (direction === Direction.North || direction === Direction.South) {
        for (const newD of [Direction.East, Direction.West]) {
          const [dr, dc, _] = adjacent.find(([_dr, _dc, d]) => d === newD)!;
          dfs(row + dr, column + dc, newD);
        }
      } else {
        const [dr, dc, _] = adjacent.find(([_dr, _dc, d]) => d === direction)!;
        dfs(row + dr, column + dc, direction);
      }
      break;
    }
    case Cell.SplitterVertical: {
      if (direction === Direction.East || direction === Direction.West) {
        for (const newD of [Direction.North, Direction.South]) {
          const [dr, dc, _] = adjacent.find(([_dr, _dc, d]) => d === newD)!;
          dfs(row + dr, column + dc, newD);
        }
      } else {
        const [dr, dc, _] = adjacent.find(([_dr, _dc, d]) => d === direction)!;
        dfs(row + dr, column + dc, direction);
      }
      break;
    }
    default: {
      throw new Error(`Unknown cell type: ${grid[row][column]}`);
    }
  }
};

dfs(0, 0, Direction.East);

// Part 1
console.log(countVisited());

let best = 0;

for (let entryRow = 0; entryRow < height; entryRow++) {
  clearVisited();
  dfs(entryRow, 0, Direction.East);
  best = Math.max(best, countVisited());

  clearVisited();
  dfs(entryRow, width - 1, Direction.West);
  best = Math.max(best, countVisited());
}

for (let entryColumn = 0; entryColumn < width; entryColumn++) {
  clearVisited();
  dfs(0, entryColumn, Direction.South);
  best = Math.max(best, countVisited());

  clearVisited();
  dfs(height - 1, entryColumn, Direction.North);
  best = Math.max(best, countVisited());
}

// Part 2
console.log(best);
