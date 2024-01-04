import _ from "lodash";
import fs from "fs";

const line: string = fs.readFileSync("inputs/day15.txt", "utf-8").trimEnd();
const steps: string[] = line.split(",");

const hash = (str: string): number =>
  _.reduce(str, (acc, c) => ((acc + c.charCodeAt(0)) * 17) % 256, 0);

// Part 1
console.log(_.sum(steps.map(hash)));

type Entries = [string, number][];
const hashmap: Entries[] = _.times(256, () => []);

steps.forEach((step) => {
  if (step.at(step.length - 1) === "-") {
    const label = step.slice(0, -1);
    const key = hash(label);

    _.remove(hashmap[key], (pair) => pair[0] === label);
  } else {
    const [label, focalLength] = step.split("=");
    const key = hash(label);
    const target = _.find(hashmap[key], (pair) => pair[0] === label);

    if (target) {
      target[1] = parseInt(focalLength);
    } else {
      hashmap[key].push([label, parseInt(focalLength)]);
    }
  }
});

// Part 2
console.log(
  _.sum(
    hashmap.map((entries, key) =>
      _.sum(
        entries.map(
          ([_label, focalLength], slotIndex) =>
            (key + 1) * (slotIndex + 1) * focalLength
        )
      )
    )
  )
);
