import { getFinalLocation } from "./util-day5";

const bestForRange = async (seedRangeContext: any) => {
  const { seedRange, mappingCollections, workerId } = seedRangeContext;
  const [seedStart, seedEnd] = seedRange;

  console.log(
    `Starting worker ${workerId} on range ${seedStart} to ${seedEnd}`
  );

  let bestHere = Infinity;

  for (let i = seedStart; i < seedEnd; i++) {
    bestHere = Math.min(bestHere, getFinalLocation(i, mappingCollections));

    // Serves as progress bar
    if (i % 10000000 === 0) {
      const progress = (
        ((i - seedStart) / (seedEnd - seedStart)) *
        100
      ).toFixed(2);
      console.log(`Worker ${workerId} progress: ${progress}% done`);
    }
  }

  console.log(`Worker ${workerId} finished!`);
  return bestHere;
};

module.exports = bestForRange;
