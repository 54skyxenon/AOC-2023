import _ from "lodash";
import fs from "fs";
import FastPriorityQueue from "fastpriorityqueue";

const grid: string[] = _.reject(
  fs.readFileSync("inputs/day17.txt", "utf-8").split("\n"),
  _.isEmpty
);

enum Direction {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

const adjacent: [number, number, Direction][] = [
  [-1, 0, Direction.North],
  [0, 1, Direction.East],
  [1, 0, Direction.South],
  [0, -1, Direction.West],
];

const oppositeDirection = (dir: Direction): Direction => (dir + 2) % 4;

const dijkstra = (
  turnMinimum: number = 0,
  streakMaximum: number = 3
): number => {
  // (Row, Column, Streak, Direction)
  const dist: number[][][][] = _.times(grid.length, () =>
    _.times(grid[0].length, () =>
      _.times(streakMaximum + 1, () => [Infinity, Infinity, Infinity, Infinity])
    )
  );

  const pq = new FastPriorityQueue<[number, number, number, number, Direction]>(
    (a, b) => a[0] < b[0]
  );

  // The starting direction doesn't matter
  dist[0][0][0] = [0, 0, 0, 0];
  pq.add([0, 0, 0, 0, Direction.East]);
  pq.add([0, 0, 0, 0, Direction.West]);
  pq.add([0, 0, 0, 0, Direction.South]);
  pq.add([0, 0, 0, 0, Direction.North]);

  while (!pq.isEmpty()) {
    const [d, r, c, streak, dir] = pq.poll()!;

    if (d > dist[r][c][streak][dir]) {
      continue;
    }

    adjacent.forEach(([dr, dc, newDir]) => {
      // Can't turn around
      if (oppositeDirection(dir) === newDir) {
        return;
      }

      const nr = r + dr;
      const nc = c + dc;

      // Out of bounds
      if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) {
        return;
      }

      const newStreak = dir === newDir ? streak + 1 : 1;
      const cost = d + parseInt(grid[nr][nc]);

      // If we change direction, we must meet minimum turn requirement
      if (dir !== newDir && streak < turnMinimum) {
        return;
      }

      // If we stay this direction, we must not exceed the streak maximum
      if (newStreak > streakMaximum) {
        return;
      }

      if (cost < dist[nr][nc][newStreak][newDir]) {
        dist[nr][nc][newStreak][newDir] = cost;
        pq.add([cost, nr, nc, newStreak, newDir]);
      }
    });
  }

  let best = Infinity;

  dist[dist.length - 1][dist[0].length - 1].forEach((streak, streakLength) => {
    // We can't stop if our streak is too short
    if (streakLength < turnMinimum) {
      return;
    }

    streak.forEach((direction) => {
      best = Math.min(best, direction);
    });
  });

  return best;
};

// Part 1
console.log(dijkstra());

// Part 2
console.log(dijkstra(4, 10));
