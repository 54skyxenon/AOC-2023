import _ from "lodash";
import fs from "fs";
import { init } from "z3-solver";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day24.txt", "utf-8").split("\n"),
  _.isEmpty
);

// 3d vector with initial position and velocity
interface Hailstone {
  readonly px: number;
  readonly py: number;
  readonly pz: number;
  readonly vx: number;
  readonly vy: number;
  readonly vz: number;
}

const parseHailstone = (line: string): Hailstone => {
  const [position, velocity] = line.split(" @ ");
  const [px, py, pz] = position.split(", ").map((n) => parseInt(n));
  const [vx, vy, vz] = velocity.split(", ").map((n) => parseInt(n));
  return { px, py, pz, vx, vy, vz };
};

// Solved the system of equations by hand and translated here...
const fallsIntoBound = (
  hailstoneA: Hailstone,
  hailstoneB: Hailstone,
  lowerBound: number,
  upperBound: number
): boolean => {
  const { px: a1, vx: b1, py: c1, vy: d1 } = hailstoneA;
  const { px: a2, vx: b2, py: c2, vy: d2 } = hailstoneB;

  const t1 = (d2 * (a1 - a2) - b2 * (c1 - c2)) / (b2 * d1 - b1 * d2);
  const t2 = (a1 - a2 + b1 * t1) / b2;

  const finalX = a1 + b1 * t1;
  const finalY = c1 + d1 * t1;

  // They must cross at a point forwards in their times
  if (t1 < 0 || t2 < 0) {
    return false;
  }

  return (
    lowerBound <= finalX &&
    finalX <= upperBound &&
    lowerBound <= finalY &&
    finalY <= upperBound
  );
};

// Do the above ^ for every unordered pair of hailstones
const countIntersections = (hailstones: Hailstone[]): number => {
  let count = 0;

  for (let i = 0; i < hailstones.length - 1; i++) {
    for (let j = i + 1; j < hailstones.length; j++) {
      const hailstoneA = hailstones[i];
      const hailstoneB = hailstones[j];
      if (
        fallsIntoBound(hailstoneA, hailstoneB, 200000000000000, 400000000000000)
      ) {
        count++;
      }
    }
  }

  return count;
};

// Part 1
console.log(countIntersections(lines.map(parseHailstone)));

/**
 *
 * Solve for rock_px, rock_py, rock_pz, rock_vx, rock_vy, rock_vz using multiple hailstones:
 *
 * rock_px + rock_vx * t = hailstone_vx * t + hailstone_px
 * rock_py + rock_vy * t = hailstone_vy * t + hailstone_py
 * rock_pz + rock_vz * t = hailstone_vz * t + hailstone_pz
 *
 */
const getStartingCoordinateSum = async (
  hailstones: Hailstone[]
): Promise<number> => {
  const { Context } = await init();
  const { Real, Solver } = Context("main");

  const rockPx = Real.const("rock_px");
  const rockPy = Real.const("rock_py");
  const rockPz = Real.const("rock_pz");
  const rockVx = Real.const("rock_vx");
  const rockVy = Real.const("rock_vy");
  const rockVz = Real.const("rock_vz");

  const solver = new Solver();

  hailstones.forEach((hailstone, i) => {
    const t = Real.const(`t_${i}`);

    solver.add(
      rockPx.add(rockVx.mul(t)).eq(t.mul(hailstone.vx).add(hailstone.px))
    );
    solver.add(
      rockPy.add(rockVy.mul(t)).eq(t.mul(hailstone.vy).add(hailstone.py))
    );
    solver.add(
      rockPz.add(rockVz.mul(t)).eq(t.mul(hailstone.vz).add(hailstone.pz))
    );
  });

  const satisfied = await solver.check();

  if (satisfied !== "sat") {
    throw new Error("Z3 solver unsatisfied");
  }

  const model = solver.model();

  return eval(
    `${model.get(rockPx)} + ${model.get(rockPy)} + ${model.get(rockPz)}`
  );
};

/**
 * Credit goes to: https://github.com/joeleisner/advent-of-code-2023/blob/main/days/24/mod.ts
 *
 * For a proper Z3 example in TypeScript.
 */
const solveForRock = async (hailstones: Hailstone[]): Promise<void> => {
  // ! Cheating: Feed output of this into ChatGPT data analysis
  // hailstones.forEach((hailstone, i) => {
  //   const t = `t_${i}`;
  //   console.log(`(a - ${hailstone.px}) - ${t} * (${hailstone.vx} - d) = 0`);
  //   console.log(`(b - ${hailstone.py}) - ${t} * (${hailstone.vy} - e) = 0`);
  //   console.log(`(c - ${hailstone.pz}) - ${t} * (${hailstone.vz} - f) = 0`);
  // });

  console.log(await getStartingCoordinateSum(hailstones));
  process.exit(0);
};

// Part 2
solveForRock(lines.map(parseHailstone));
