import _, { Dictionary } from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day5.txt", "utf-8").split("\n"),
  _.isEmpty
);

const delimiter: string = "***";

interface RangeMapping extends Dictionary<number> {
  destinationRangeStart: number;
  sourceRangeStart: number;
  rangeLength: number;
}

type MappingCollection = RangeMapping[];

// Part 1
const applyMappingCollection = (
  location: number,
  mappingCollection: MappingCollection
): number => {
  const mapping = _.find(
    mappingCollection,
    ({ destinationRangeStart, sourceRangeStart, rangeLength }) => {
      return (
        location >= sourceRangeStart &&
        location < sourceRangeStart + rangeLength
      );
    }
  ) as RangeMapping;

  if (mapping) {
    const offset: number = location - mapping.sourceRangeStart;
    return mapping.destinationRangeStart + offset;
  }

  return location;
};

const getFinalLocation = (
  seedLocation: number,
  mappingCollections: MappingCollection[]
): number => _.reduce(mappingCollections, applyMappingCollection, seedLocation);

const seedLocations: number[] = lines[0]
  .split(": ")[1]
  .split(" ")
  .map((seedLocation) => parseInt(seedLocation, 10));

const mappingCollections = lines
  .slice(1)
  .map((line) => (line.endsWith("map:") ? delimiter : line + " "))
  .join("")
  .split(delimiter)
  .filter((tokens) => !_.isEmpty(tokens))
  .map((tokens) => _.reject(tokens.split(" "), _.isEmpty))
  .map((tokens) => tokens.map((token) => parseInt(token, 10)))
  .map((tokens) => _.chunk(tokens, 3))
  .map((tokens) =>
    tokens.map((tokenChunk) =>
      _.zipObject(
        ["destinationRangeStart", "sourceRangeStart", "rangeLength"],
        tokenChunk
      )
    )
  ) as MappingCollection[];

console.log(
  _.min(
    seedLocations.map((seedLocation) =>
      getFinalLocation(seedLocation, mappingCollections)
    )
  )
);

// Part 2
const allSeedLocations = _.chunk(seedLocations, 2).map((seedLocationPair) => [
  seedLocationPair[0],
  seedLocationPair[0] + seedLocationPair[1],
]);

allSeedLocations.sort((a, b) => {
  const [a1, a2] = a;
  const [b1, b2] = b;

  if (a1 !== b1) {
    return a1 - b1;
  }

  return a2 - b2;
});

// This will take a long ass time, but not forever
console.log(
  _.min(
    allSeedLocations.map(([seedStart, seedEnd]) => {
      let bestHere = Infinity;

      for (let i = seedStart; i < seedEnd; i++) {
        bestHere = Math.min(bestHere, getFinalLocation(i, mappingCollections));

        // Serves as progress bar
        if (i % 1000000 === 0) {
          console.log(
            "At",
            i,
            "best so far for the current range of seeds is",
            bestHere
          );
        }
      }

      return bestHere;
    })
  )
);
