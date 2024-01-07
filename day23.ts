import _ from "lodash";
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

const dfs = (row: number, col: number, visited: Set<number>): number => {
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
      visited.has(neighborId) ||
      lines[row + dr][col + dc] === "#"
    ) {
      return;
    }

    visited.add(neighborId);
    opt = Math.max(opt, 1 + dfs(row + dr, col + dc, visited));
    visited.delete(neighborId);
  });

  return opt;
};

interface AdjListNode {
  v: number;
  weight: number;
}

class Graph {
  V: number;
  adj: AdjListNode[][];

  constructor(V: number) {
    this.V = V;
    this.adj = _.times(V, () => []);
  }

  topologicalSortUtil(v: number, visited: boolean[], stack: number[]) {
    visited[v] = true;

    for (let j in this.adj[v]) {
      let i = this.adj[v][j];
      let node = i;
      if (!visited[node.v]) this.topologicalSortUtil(node.v, visited, stack);
    }

    stack.push(v);
  }

  addEdge(u: number, v: number, weight: number) {
    this.adj[u].push({ v, weight });
  }

  longestPath(s: number): number[] {
    const stack: number[] = [];
    const visited = _.times(this.V, _.constant(false));

    for (let i = 0; i < this.V; i++) {
      if (!visited[i]) {
        this.topologicalSortUtil(i, visited, stack);
      }
    }

    const dist = _.times(this.V, _.constant(Number.MIN_VALUE));
    dist[s] = 0;

    while (stack.length > 0) {
      let u = stack.pop()!;

      if (dist[u] != Number.MIN_VALUE) {
        for (let j in this.adj[u]) {
          let i = this.adj[u][j];
          if (dist[i.v] < dist[u] + i.weight) dist[i.v] = dist[u] + i.weight;
        }
      }
    }

    return dist;
  }
}

/**
 * @link https://www.geeksforgeeks.org/find-longest-path-directed-acyclic-graph/
 */
const dfsEfficient = (startRow: number, startCol: number): number => {
  const graph = new Graph(height * width);

  // Stack based DFS
  const stack: [number, number][] = [[startRow, startCol]];
  const visited = new Set<number>([startRow * width + startCol]);

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const thisId = r * width + c;

    adjacent.forEach(([dr, dc]) => {
      const newRow = r + dr;
      const newCol = c + dc;
      const neighborId = newRow * width + newCol;

      if (
        newRow < 0 ||
        newRow >= height ||
        newCol < 0 ||
        newCol >= width ||
        lines[newRow][newCol] === "#"
      ) {
        return;
      }

      if (!visited.has(neighborId)) {
        stack.push([newRow, newCol]);
        visited.add(neighborId);
      }

      graph.addEdge(thisId, neighborId, 1);
    });
  }

  return graph.longestPath(startRow * width + startCol)[
    endRow * width + endCol
  ];
};

// Part 1
console.log(
  dfs(startRow, startCol, new Set<number>([startRow * width + startCol]))
);

// Part 2
console.log(dfsEfficient(startRow, startCol));
