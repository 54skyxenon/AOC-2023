import _, { Dictionary } from "lodash";

export const delimiter: string = "***";

export interface RangeMapping extends Dictionary<number> {
  destinationRangeStart: number;
  sourceRangeStart: number;
  rangeLength: number;
}

export type MappingCollection = RangeMapping[];

export const applyMappingCollection = (
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

export const getFinalLocation = (
  seedLocation: number,
  mappingCollections: MappingCollection[]
): number => _.reduce(mappingCollections, applyMappingCollection, seedLocation);
