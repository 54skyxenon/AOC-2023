import _ from "lodash";
import "lodash.product";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day21.txt", "utf-8").split("\n"),
  _.isEmpty
);

const getStartingPosition = (): [number, number] =>
  _.find(
    _.product(_.range(0, lines.length), _.range(0, lines[0].length)),
    ([row, col]) => lines[row][col] === "S"
  )! as [number, number];

/**
 * Naive solution of just enumerating every position `steps` amount away from a certain start point.
 */
const solveBfs = (startingRow: number, startingCol: number, steps: number) => {
  const height = lines.length;
  const width = lines[0].length;

  const adjacent: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  const visited: number[][][] = _.times(height, () =>
    _.times(width, () => _.times(steps + 1, _.constant(0)))
  );

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
        depth + 1 > steps ||
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
      ([row, col]) => visited[row][col][steps]
    )
  );
};

console.log(solveBfs(...getStartingPosition(), 64));

/**
 * Gave up on this one and translated HyperNeutrino's solution with my own annotations:
 * https://www.youtube.com/watch?v=9UOMZSL0JTg
 *
 * ^ I highly recommend watching, it's a great explanation!
 *
 * Assumptions:
 * - The grid is always a square
 * - Grid width of 131 yields divmod(26501365, 131) => (202300, 65)
 */
const solveEfficiently = (steps: number): number => {
  const size = lines.length;
  const gridWidth = Math.floor(steps / size) - 1;
  const [sr, sc] = getStartingPosition();

  // Number of complete grids of odd/even Manhattan distance from the start
  const odd = (Math.floor(gridWidth / 2) * 2 + 1) ** 2;
  const even = (Math.floor((gridWidth + 1) / 2) * 2) ** 2;

  // Visited cells in a single complete grid of odd/even Manhattan distance from the start
  const oddPoints = solveBfs(sr, sc, size * 2 + 1);
  const evenPoints = solveBfs(sr, sc, size * 2);

  // Visited cells in 4 edge grids of the visited range
  // ! There's a direct path from the elf to the corners, so we can do this
  const cornerSteps = size - 1;
  const cornerT = solveBfs(size - 1, sc, cornerSteps);
  const cornerR = solveBfs(sr, 0, cornerSteps);
  const cornerB = solveBfs(0, sc, cornerSteps);
  const cornerL = solveBfs(sr, size - 1, cornerSteps);

  // Where the elf starts in the non-direct outermost layer grids
  const entryPoints = [
    [size - 1, 0],
    [size - 1, size - 1],
    [0, 0],
    [0, size - 1],
  ];

  // Visited cells within the smaller half cut in the non-direct outermost layer grids (besides the 4 corner grids)
  const smallSteps = Math.floor(size / 2) - 1;
  const [smallTr, smallTl, smallBr, smallBl] = entryPoints.map(([r, c]) =>
    solveBfs(r, c, smallSteps)
  );

  // Visited cells within the larger half cut in the non-direct outermost layer grids (besides the 4 corner grids)
  const largeSteps = Math.floor((size * 3) / 2) - 1;
  const [largeTr, largeTl, largeBr, largeBl] = entryPoints.map(([r, c]) =>
    solveBfs(r, c, largeSteps)
  );

  return (
    odd * oddPoints +
    even * evenPoints +
    cornerT +
    cornerR +
    cornerB +
    cornerL +
    (gridWidth + 1) * (smallTr + smallTl + smallBr + smallBl) +
    gridWidth * (largeTr + largeTl + largeBr + largeBl)
  );
};

console.log(solveEfficiently(26501365));
