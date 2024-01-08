import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day25.txt", "utf-8").split("\n"),
  _.isEmpty
);

const originalGraph: Map<string, Set<string>> = new Map();
const edges: [string, string][] = [];

const addEdges = (line: string) => {
  const [node, neighbors] = line.split(": ");

  if (!originalGraph.has(node)) {
    originalGraph.set(node, new Set());
  }

  neighbors.split(" ").forEach((neighbor) => {
    if (!originalGraph.has(neighbor)) {
      originalGraph.set(neighbor, new Set());
    }

    const unorderedEdge = [node, neighbor].sort() as [string, string];

    if (!edges.some((edge) => _.isEqual(edge, unorderedEdge))) {
      edges.push(unorderedEdge);
    }

    originalGraph.get(node)!.add(neighbor);
    originalGraph.get(neighbor)!.add(node);
  });
};

/**
 * Return the component sizes if we remove the given edges.
 *
 * ! This mutates the original graph, since we assume it's only called one time.
 */
const componentSizes = (
  edgeA: [string, string],
  edgeB: [string, string],
  edgeC: [string, string]
): number[] => {
  originalGraph.get(edgeA[0])!.delete(edgeA[1]);
  originalGraph.get(edgeA[1])!.delete(edgeA[0]);
  originalGraph.get(edgeB[0])!.delete(edgeB[1]);
  originalGraph.get(edgeB[1])!.delete(edgeB[0]);
  originalGraph.get(edgeC[0])!.delete(edgeC[1]);
  originalGraph.get(edgeC[1])!.delete(edgeC[0]);

  const nodes = Array.from(originalGraph.keys());
  const allVisited = new Set<string>();

  const dfs = (node: string, visited: Set<string>) => {
    originalGraph.get(node)!.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        dfs(neighbor, visited);
      }
    });
  };

  const sizes: number[] = [];

  nodes.forEach((node) => {
    if (!allVisited.has(node)) {
      const visited = new Set<string>([node]);
      dfs(node, visited);

      for (const node of visited) {
        allVisited.add(node);
      }

      sizes.push(visited.size);
    }
  });

  return sizes;
};

interface Edge {
  readonly src: number;
  readonly dest: number;
}

interface Graph {
  readonly V: number;
  readonly E: number;
  readonly edges: Edge[];
}

interface Subset {
  parent: number;
  rank: number;
}

const dsuFind = (subsets: Subset[], i: number): number => {
  if (subsets[i].parent !== i) {
    subsets[i].parent = dsuFind(subsets, subsets[i].parent);
  }
  return subsets[i].parent;
};

const dsuUnion = (subsets: Subset[], x: number, y: number): void => {
  let xroot = dsuFind(subsets, x);
  let yroot = dsuFind(subsets, y);

  if (subsets[xroot].rank < subsets[yroot].rank) {
    subsets[xroot].parent = yroot;
  } else if (subsets[xroot].rank > subsets[yroot].rank) {
    subsets[yroot].parent = xroot;
  } else {
    subsets[yroot].parent = xroot;
    subsets[xroot].rank++;
  }
};

/**
 * A fast, but probabilistic algorithm:
 *
 * https://www.geeksforgeeks.org/introduction-and-implementation-of-kargers-algorithm-for-minimum-cut/
 */
const karger = (graph: Graph): Edge[] => {
  const subsets = _.times(graph.V, (i) => ({
    parent: i,
    rank: 0,
  })) as Subset[];

  let reproductOfCutsingVertices = graph.V;

  while (reproductOfCutsingVertices > 2) {
    const i = Math.floor(Math.random() * graph.E) % graph.E;

    const subset1 = dsuFind(subsets, graph.edges[i].src);
    const subset2 = dsuFind(subsets, graph.edges[i].dest);

    if (subset1 !== subset2) {
      reproductOfCutsingVertices--;
      dsuUnion(subsets, subset1, subset2);
    }
  }

  const minCut = [];

  for (let i = 0; i < graph.E; i++) {
    const subset1 = dsuFind(subsets, graph.edges[i].src);
    const subset2 = dsuFind(subsets, graph.edges[i].dest);

    if (subset1 !== subset2) {
      minCut.push(graph.edges[i]);
    }
  }

  return minCut;
};

const productOfCuts = (lines: string[]): number => {
  lines.forEach(addEdges);
  const nodes = Array.from(originalGraph.keys());

  const nodeToIndex = new Map<string, number>();
  nodes.forEach((node, index) => {
    nodeToIndex.set(node, index);
  });

  let graph = {
    V: originalGraph.size,
    E: edges.length,
    edges: [] as Edge[],
  };

  edges.forEach(([nodeA, nodeB], i) => {
    const indexA = nodeToIndex.get(nodeA)!;
    const indexB = nodeToIndex.get(nodeB)!;
    graph.edges.push({ src: indexA, dest: indexB });
  });

  // Use a different seed value for every run.
  Math.random();

  while (true) {
    const probableMinCut = karger(graph);

    // Guaranteed by the problem statement.
    if (probableMinCut.length === 3) {
      const edgeA: [string, string] = [
        nodes[probableMinCut[0].src],
        nodes[probableMinCut[0].dest],
      ];
      const edgeB: [string, string] = [
        nodes[probableMinCut[1].src],
        nodes[probableMinCut[1].dest],
      ];
      const edgeC: [string, string] = [
        nodes[probableMinCut[2].src],
        nodes[probableMinCut[2].dest],
      ];

      const [sizeA, sizeB] = componentSizes(edgeA, edgeB, edgeC);
      return sizeA * sizeB;
    }
  }
};

console.log(productOfCuts(lines));
console.log("Enjoy your 50th star! ⭐ ⭐ ⭐");
