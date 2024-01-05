import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day19.txt", "utf-8").split("\n"),
  _.isEmpty
);

interface Rule {
  readonly callback: (input: Part) => string | undefined;
  readonly ruleString: string;
}

interface Workflow {
  readonly name: string;
  readonly rules: Rule[];
}

interface Part {
  readonly x: number;
  readonly m: number;
  readonly a: number;
  readonly s: number;
}

// For maximum flexibility, we'll build a rule lambda
const buildRule = (ruleString: string): Rule => {
  const colonIndex = ruleString.indexOf(":");

  if (colonIndex === -1) {
    return { callback: (_) => ruleString, ruleString };
  } else {
    const [condition, output] = ruleString.split(":");

    const lhs = condition.charAt(0);
    const operator = condition.charAt(1);
    const rhs = condition.slice(2);

    return {
      callback: (input) => {
        const substitution = input[lhs as keyof Part];

        if (eval(`${substitution} ${operator} ${rhs}`)) {
          return output;
        }

        return undefined;
      },
      ruleString,
    };
  }
};

const workflows: Map<string, Workflow> = new Map();
const parts: Part[] = [];

// Example: px{a<2006:qkq,m>2090:A,rfg}
const addWorkflow = (line: string): void => {
  const openingBracket = line.indexOf("{");

  const name = line.slice(0, openingBracket);
  const rules = line
    .slice(openingBracket + 1, line.length - 1)
    .split(",")
    .map(buildRule);

  workflows.set(name, { name, rules });
};

// Example: {x=787,m=2655,a=1222,s=2876}
const addPart = (line: string): void => {
  const [x, m, a, s] = line
    .slice(1, line.length - 1)
    .split(",")
    .map((part) => parseInt(part.split("=")[1]));

  parts.push({ x, m, a, s });
};

// Is the original part accepted by the workflow or its derivatives?
const isAccepted = (part: Part, currentRuleName: string): boolean => {
  const workflow: Workflow = workflows.get(currentRuleName)!;

  // Find the first applicable rule and call it inline
  const result: string = _.find(
    workflow.rules,
    ({ callback }) => callback(part) !== undefined
  )!.callback(part)!;

  if (result === "A") {
    return true;
  }

  if (result === "R") {
    return false;
  }

  return isAccepted(part, result);
};

const sumPart = (part: Part): number => _.sum(Object.values(part));

lines.forEach((line) => {
  if (line.startsWith("{")) {
    addPart(line);
  } else {
    addWorkflow(line);
  }
});

// Part 1
console.log(
  _.sum(parts.map((part) => (isAccepted(part, "in") ? sumPart(part) : 0)))
);

interface PartRanges {
  readonly x: [number, number];
  readonly m: [number, number];
  readonly a: [number, number];
  readonly s: [number, number];
}

const rangesMultiply = (partRanges: PartRanges): number => {
  const lengths = Object.values(partRanges).map(([min, max]) =>
    Math.max(0, max - min + 1)
  );

  return lengths.reduce((a, b) => a * b);
};

// We can sum the range counts that are valid whenever we hit a base case!
const countAccepted = (
  partRanges: PartRanges,
  currentRuleName: string
): number => {
  if (currentRuleName === "A") {
    return rangesMultiply(partRanges);
  }

  if (currentRuleName === "R") {
    return 0;
  }

  const workflow: Workflow = workflows.get(currentRuleName)!;

  let possibilities = 0;

  for (let ruleIndex = 0; ruleIndex < workflow.rules.length; ruleIndex++) {
    const ruleString = workflow.rules[ruleIndex].ruleString;

    if (ruleString === "A") {
      possibilities += rangesMultiply(partRanges);
      break;
    }

    if (ruleString === "R") {
      break;
    }

    const colonIndex = ruleString.indexOf(":");

    if (colonIndex === -1) {
      possibilities += countAccepted(partRanges, ruleString);
      break;
    }

    // We have to constrict the ranges for the next rule
    const [condition, output] = ruleString.split(":");

    const lhs = condition.charAt(0);
    const operator = condition.charAt(1);
    const rhs = parseInt(condition.slice(2));

    if (operator === ">") {
      // Activate this rule with a new range we split off
      const newPartRanges = _.cloneDeep(partRanges);
      newPartRanges[lhs as keyof PartRanges][0] = Math.max(
        newPartRanges[lhs as keyof PartRanges][0],
        rhs + 1
      );

      possibilities += countAccepted(newPartRanges, output);

      // Modify this range to head past this rule
      partRanges[lhs as keyof PartRanges][1] = Math.min(
        partRanges[lhs as keyof PartRanges][1],
        rhs
      );
    } else if (operator === "<") {
      // Activate this rule with a new range we split off
      const newPartRanges = _.cloneDeep(partRanges);
      newPartRanges[lhs as keyof PartRanges][1] = Math.min(
        newPartRanges[lhs as keyof PartRanges][1],
        rhs - 1
      );

      possibilities += countAccepted(newPartRanges, output);

      // Modify this range to head past this rule
      partRanges[lhs as keyof PartRanges][0] = Math.max(
        partRanges[lhs as keyof PartRanges][0],
        rhs
      );
    }
  }

  return possibilities;
};

// Part 2
console.log(
  countAccepted(
    {
      x: [1, 4000],
      m: [1, 4000],
      a: [1, 4000],
      s: [1, 4000],
    },
    "in"
  )
);
