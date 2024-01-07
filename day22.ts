import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day22.txt", "utf-8").split("\n"),
  _.isEmpty
);

interface Brick {
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
}

const parseBrickString = (line: string): Brick => {
  const [start, end] = line.split("~");
  const [startX, startY, startZ] = start.split(",").map(Number);
  const [endX, endY, endZ] = end.split(",").map(Number);
  return { startX, startY, startZ, endX, endY, endZ };
};

// Would brick A intersect brick B if it fell?
const intersects = (brickA: Brick, brickB: Brick): boolean => {
  const xOverlap = [
    Math.max(brickA.startX, brickB.startX),
    Math.min(brickA.endX, brickB.endX),
  ];
  const yOverlap = [
    Math.max(brickA.startY, brickB.startY),
    Math.min(brickA.endY, brickB.endY),
  ];
  const zOverlap = [
    Math.max(brickA.startZ, brickB.startZ),
    Math.min(brickA.endZ, brickB.endZ),
  ];

  return (
    xOverlap[0] <= xOverlap[1] &&
    yOverlap[0] <= yOverlap[1] &&
    zOverlap[0] <= zOverlap[1]
  );
};

// Can we move this brick down without occupying another brick's space in 3d?
const fallsFreely = (brick: Brick, fallenBricks: Brick[]): boolean => {
  const brickCopy = _.cloneDeep(brick);
  brickCopy.startZ--;
  brickCopy.endZ--;

  return (
    brickCopy.startZ > 0 &&
    fallenBricks.every((fallenBrick) => !intersects(brickCopy, fallenBrick))
  );
};

// Simulate gravity on all of the bricks, returning a copy
const applyGravity = (bricks: Brick[]): Brick[] => {
  const bricksCopy = _.cloneDeep(bricks);

  for (let i = 1; i < bricksCopy.length; i++) {
    while (true) {
      let edited = false;

      if (fallsFreely(bricksCopy[i], bricksCopy.slice(0, i))) {
        bricksCopy[i].startZ--;
        bricksCopy[i].endZ--;
        edited = true;
      }

      if (!edited) {
        break;
      }
    }
  }

  return bricksCopy;
};

/**
 * (Part 1) Brick indices that this brick falls onto first by simulating gravity one unit at a time.
 *
 * If it hits the ground first (z = 0), then the empty list is returned.
 */
const fallsOntoFirst = (i: number): number[] => {
  const brick = _.cloneDeep(bricks[i]);

  while (brick.startZ > 0) {
    brick.startZ--;
    brick.endZ--;

    const fallingBricks = _.range(bricks.length).filter(
      (j) => j !== i && intersects(brick, bricks[j])
    );

    if (fallingBricks.length > 0) {
      return fallingBricks;
    }
  }

  return [];
};

/**
 * (Part 2) How many bricks fall when brick i is removed?
 *
 * * Assumes that original bricks have gravity applied to them already and are sorted by startZ.
 */
const getFallingBricksCount = (i: number): number => {
  let count = 0;

  // Prefix before i is what bricks are stationary below us
  const fallen = _.cloneDeep(bricks.slice(0, i));

  // Suffix after i is what bricks may fall above us
  const yetToFall = _.cloneDeep(bricks.slice(i + 1));

  while (yetToFall.length > 0) {
    const currentStartZ = yetToFall[0].startZ;
    const fallingNow = [];

    while (yetToFall.length > 0 && yetToFall[0].startZ === currentStartZ) {
      fallingNow.push(yetToFall.shift()!);
    }

    fallingNow.forEach((brick) => {
      if (fallsFreely(brick, fallen)) {
        brick.startZ--;
        brick.endZ--;
        count++;
      }
      fallen.push(brick);
    });
  }

  return count;
};

const bricks = applyGravity(
  lines.map(parseBrickString).sort((a, b) => a.startZ - b.startZ)
);

const dangerousBricks = new Set<number>();

_.range(bricks.length)
  .map(fallsOntoFirst)
  .forEach((supporting) => {
    if (supporting.length === 1) {
      dangerousBricks.add(supporting[0]);
    }
  });

// Part 1
console.log(bricks.length - dangerousBricks.size);

// Part 2 (wait a few seconds)
console.log(_.sum(Array.from(dangerousBricks).map(getFallingBricksCount)));
