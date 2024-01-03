import _ from "lodash";
import "lodash.product";
import fs from "fs";

let grid: string[] = _.reject(
  fs.readFileSync("inputs/day10.txt", "utf-8").split("\n"),
  _.isEmpty
);

const DILATION_FACTOR = 3;

enum Direction {
  North = "N",
  South = "S",
  East = "E",
  West = "W",
}

enum Tile {
  VerticalPipe = "|",
  HorizontalPipe = "-",
  NorthEastBend = "L",
  NorthWestBend = "J",
  SouthWestBend = "7",
  SouthEastBend = "F",
  Ground = ".",
  Start = "S",
}

interface Point2D {
  row: number;
  column: number;
}

type Movement = [number, number, Direction];

// Pad grid with empty tiles on four sides
grid = grid.map((row) => `.${row}.`);
grid.unshift(".".repeat(grid[0].length));
grid.push(".".repeat(grid[0].length));

const gridHeight: number = grid.length;
const gridWidth: number = grid[0].length;
const dilatedGridHeight: number = gridHeight * DILATION_FACTOR;
const dilatedGridWidth: number = gridWidth * DILATION_FACTOR;

const getNextDirection = (
  incomingDirection: Direction,
  tile: Tile
): Direction | undefined => {
  const mapping: Record<any, Record<any, any>> = {
    [Tile.NorthEastBend]: {
      [Direction.West]: Direction.North,
      [Direction.South]: Direction.East,
    },
    [Tile.NorthWestBend]: {
      [Direction.East]: Direction.North,
      [Direction.South]: Direction.West,
    },
    [Tile.SouthWestBend]: {
      [Direction.East]: Direction.South,
      [Direction.North]: Direction.West,
    },
    [Tile.SouthEastBend]: {
      [Direction.West]: Direction.South,
      [Direction.North]: Direction.East,
    },
    [Tile.VerticalPipe]: {
      [Direction.North]: Direction.North,
      [Direction.South]: Direction.South,
    },
    [Tile.HorizontalPipe]: {
      [Direction.East]: Direction.East,
      [Direction.West]: Direction.West,
    },
  };

  return mapping[tile]?.[incomingDirection];
};

const getDilatedPointId = ({ row, column }: Point2D): number => {
  return row * dilatedGridWidth + column;
};

const sLocationFlattened: number = grid.join("").indexOf("S");
const sLocation: Point2D = {
  row: Math.floor(sLocationFlattened / gridWidth),
  column: sLocationFlattened % gridWidth,
};
const loopTilePoints: Point2D[] = [sLocation];

// Part 1
const simulate = (startingPoint: Point2D): number => {
  const movements: Movement[] = [
    [-1, 0, Direction.North],
    [1, 0, Direction.South],
    [0, -1, Direction.West],
    [0, 1, Direction.East],
  ];

  // DFS until we find an initial direction that works
  for (const [dr, dc, direction] of movements) {
    let currentDirection = direction;

    const path = [
      startingPoint,
      {
        row: startingPoint.row + dr,
        column: startingPoint.column + dc,
      },
    ];

    while (true) {
      const { row, column } = path[path.length - 1];

      // If out of bounds, exit
      if (row < 0 || row >= gridHeight || column < 0 || column >= gridWidth) {
        break;
      }

      if (grid[row][column] === "S" && path.length > 1) {
        loopTilePoints.push(...path.slice(1));
        return Math.floor(path.length / 2);
      }

      const nextDirection = getNextDirection(
        currentDirection,
        grid[row][column] as Tile
      );

      // If no next direction, exit
      const nextMove = _.find(
        movements,
        (movement) => movement[2] === nextDirection
      ) as Movement | undefined;

      if (nextMove === undefined) {
        break;
      }

      path.push({
        row: row + nextMove[0],
        column: column + nextMove[1],
      });
      currentDirection = nextDirection!;
    }
  }

  throw new Error("No path was found");
};

console.log(simulate(sLocation));

// Part 2
// Idea borrowed from: https://www.reddit.com/r/adventofcode/comments/18ey1s7/comment/kcqoxd5
const floodFill = (): number => {
  const loopTilePointsDilated: Point2D[] = loopTilePoints.map(
    ({ row, column }) => ({
      row: row * DILATION_FACTOR,
      column: column * DILATION_FACTOR,
    })
  );
  loopTilePointsDilated.push(loopTilePointsDilated[0]);

  const loopTilePointsDilatedFilled: Set<number> = new Set();

  loopTilePointsDilated.forEach((point, i) => {
    if (i === 0) {
      return;
    }

    const { row, column } = point;
    const { row: prevRow, column: prevColumn } = loopTilePointsDilated[i - 1];

    // Get all the points between the current point and the previous point
    _.product(
      _.range(Math.min(row, prevRow), Math.max(row, prevRow) + 1),
      _.range(Math.min(column, prevColumn), Math.max(column, prevColumn) + 1)
    ).forEach(([row, column]) => {
      loopTilePointsDilatedFilled.add(getDilatedPointId({ row, column }));
    });
  });

  // BFS from edge to get all outer points
  const outerPoints: Set<number> = new Set([0]);
  const queue: Point2D[] = [{ row: 0, column: 0 }];

  while (queue.length > 0) {
    const { row, column } = queue.shift() as Point2D;
    const adjacent = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    adjacent.forEach(([dr, dc]) => {
      const nextPoint = {
        row: row + dr,
        column: column + dc,
      };
      const dilatedPointId = getDilatedPointId(nextPoint);

      if (
        0 <= nextPoint.row &&
        nextPoint.row < dilatedGridHeight &&
        0 <= nextPoint.column &&
        nextPoint.column < dilatedGridWidth &&
        !outerPoints.has(dilatedPointId) &&
        !loopTilePointsDilatedFilled.has(dilatedPointId)
      ) {
        outerPoints.add(dilatedPointId);
        queue.push(nextPoint);
      }
    });
  }

  // Find all inner points, or undilated ground tiles that are not outer points
  const innerPoints: Point2D[] = _.product(
    _.range(0, dilatedGridHeight),
    _.range(0, dilatedGridWidth)
  )
    .map(([row, column]) => ({ row, column } as Point2D))
    .filter(({ row, column }) => {
      const dilatedPointId = getDilatedPointId({ row, column });

      if (
        !outerPoints.has(dilatedPointId) &&
        !loopTilePointsDilatedFilled.has(dilatedPointId) &&
        row % DILATION_FACTOR === 0 &&
        column % DILATION_FACTOR === 0
      ) {
        return true;
      }
    });

  return innerPoints.length;
};

console.log(floodFill());
