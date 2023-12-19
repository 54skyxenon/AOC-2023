import _ from "lodash";
import fs from "fs";
import { Pool } from "multiprocess-pool";
import { delimiter, MappingCollection, getFinalLocation } from "./util-day5";

const main = async () => {
  // Parse input from txt file
  const lines: string[] = _.reject(
    fs.readFileSync("inputs/day5.txt", "utf-8").split("\n"),
    _.isEmpty
  );

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

  // Part 1
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

  const workerContexts = allSeedLocations.map((seedLocationPair, index) => ({
    seedRange: seedLocationPair,
    mappingCollections: mappingCollections,
    workerId: index,
  }));

  // This will take a long ass time, but not forever
  console.log("Spinning up workers for part 2...");
  const timeStart = Date.now();

  const pool = new Pool(allSeedLocations.length);
  console.log(
    _.min(await pool.map(workerContexts, __dirname + "/worker-day5"))
  );
  pool.close();

  const timeElapsed = Date.now() - timeStart;
  console.log(
    `Completed part 2 in ${Math.floor(timeElapsed / 60000)} minutes!`
  );
};

main();
