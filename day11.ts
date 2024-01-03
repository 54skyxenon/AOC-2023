import _ from "lodash";
import "lodash.product";
import fs from "fs";
import FastPriorityQueue from "fastpriorityqueue";

const image: string[] = _.reject(
  fs.readFileSync("inputs/day11.txt", "utf-8").split("\n"),
  _.isEmpty
);

const expandVertically = (image: string[]): string[] =>
  image.map((row: string) => {
    if (row.indexOf("#") > -1) {
      return row;
    }

    return "X".repeat(row.length);
  });

const rotate = (image: string[]): string[] =>
  _.zip(...image.map((r) => r.split(""))).map((r) => r.join(""));

// ! Takes ~11 seconds to run on full input
// Solve all-pairs shortest path problem (Dijkstra beats Floyd-Warshall for sparse graphs)
const dijkstra = (
  image: string[],
  galaxies: number[],
  gapUnits: number
): number => {
  let distanceSum = 0;

  for (const sourceGalaxy of galaxies) {
    const height = image.length;
    const width = image[0].length;

    // Run Floyd Warshall algorithm from source to everywhere else
    const queue = new FastPriorityQueue(
      (a: [number, number], b: [number, number]) => a[1] < b[1]
    );
    queue.add([sourceGalaxy, 0]);

    const distance: Record<number, number> = {
      [sourceGalaxy]: 0,
    };

    while (!queue.isEmpty()) {
      const [current, depth] = queue.poll()!;
      if (depth > distance[current]) {
        continue;
      }

      // Add all unvisited neighbors to the queue
      const r = Math.floor(current / width);
      const c = current % width;

      for (const [dr, dc] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const nr = r + dr;
        const nc = c + dc;
        const neighbor = nr * width + nc;
        if (nr >= 0 && nr < height && nc >= 0 && nc < width) {
          const cost = depth + (image[nr][nc] === "X" ? gapUnits : 1);
          if (cost < distance[neighbor] || distance[neighbor] === undefined) {
            distance[neighbor] = cost;
            queue.add([neighbor, cost]);
          }
        }
      }
    }

    distanceSum += _.sum(
      Object.entries(distance).map(([galaxy, distance]) => {
        if (
          parseInt(galaxy) <= sourceGalaxy ||
          image[Math.floor(parseInt(galaxy) / width)][
            parseInt(galaxy) % width
          ] !== "#"
        ) {
          return 0;
        }
        return distance;
      })
    );
  }

  return distanceSum;
};

const solvePart = (gapUnits: number): number => {
  // Expand vertically -> rotate -> Expand vertically -> rotate back for horizontal expansion
  const expanded = rotate(
    rotate(rotate(expandVertically(rotate(expandVertically(image)))))
  );

  const expandedHeight = expanded.length;
  const expandedWidth = expanded[0].length;

  const galaxies = _.range(0, expandedHeight * expandedWidth).filter(
    (cellId) => {
      const r = Math.floor(cellId / expandedWidth);
      const col = cellId % expandedWidth;
      return expanded[r][col] === "#";
    }
  );

  return dijkstra(expanded, galaxies, gapUnits);
};

// Part 1
console.log(solvePart(2));

// Part 2
console.log(solvePart(1e6));
