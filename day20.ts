import _ from "lodash";
import fs from "fs";

const lines: string[] = _.reject(
  fs.readFileSync("inputs/day20.txt", "utf-8").split("\n"),
  _.isEmpty
);

enum Pulse {
  High = "High",
  Low = "Low",
}

const gcd = (a: number, b: number): number => {
  if (b == 0) {
    return a;
  }

  return gcd(b, a % b);
};

const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);

abstract class RootModule {
  readonly name: string;
  readonly outputs: string[];

  constructor(name: string) {
    this.name = name;
    this.outputs = [];
  }

  /**
   * Adds shortened output module name to this module's output list.
   */
  connectOutput(outputModuleName: string): void {
    this.outputs.push(outputModuleName);
  }

  /**
   * Adds shortened input module name to this module's input list.
   */
  connectInput(_inputModuleName: string): void {}

  /**
   * How many button presses are needed for this module to send a low pulse for the first time?
   */
  abstract lowPulseCycleLength(): number;

  /**
   * Process the incoming pulse and queue up any outgoing pulses.
   */
  abstract receivePulse(inputModuleName: string, pulse: Pulse): void;

  /**
   * (Called when applicable) send the queued pulse.
   */
  abstract sendPulse(): void;
}

class FlipFlop extends RootModule {
  private on: boolean;
  private firstLowPulseCycle: number;

  constructor(name: string) {
    super(name);
    this.on = false;
    this.firstLowPulseCycle = Infinity;
  }

  lowPulseCycleLength(): number {
    return this.firstLowPulseCycle;
  }

  receivePulse(_inputModuleName: string, pulse: Pulse): void {
    if (pulse === Pulse.High) {
      return;
    }

    if (pulse === Pulse.Low) {
      this.firstLowPulseCycle = Math.min(
        this.firstLowPulseCycle,
        Network.part2ButtonPresses
      );
    }

    this.on = !this.on;
    Network.queuedPulseSends.push(this.name);
  }

  sendPulse(): void {
    if (!this.on) {
      this.outputs.forEach((outputModule) => {
        Network.delegatePulse(this.name, outputModule, Pulse.Low);
      });
    } else {
      this.outputs.forEach((outputModule) => {
        Network.delegatePulse(this.name, outputModule, Pulse.High);
      });
    }
  }
}

class Conjunction extends RootModule {
  private inputs: Map<string, Pulse>;
  private inputLowPulseCycles: Map<string, number>;

  constructor(name: string) {
    super(name);
    this.inputs = new Map();
    this.inputLowPulseCycles = new Map();
  }

  connectInput(inputModuleName: string): void {
    this.inputs.set(inputModuleName, Pulse.Low);
    this.inputLowPulseCycles.set(inputModuleName, Infinity);
  }

  lowPulseCycleLength(): number {
    const cycleLengths = [...this.inputLowPulseCycles.values()];

    if (
      cycleLengths.length > 0 &&
      cycleLengths.every((cycle) => cycle !== Infinity)
    ) {
      return cycleLengths.reduce(lcm);
    }

    return Infinity;
  }

  receivePulse(inputModuleName: string, pulse: Pulse): void {
    this.inputs.set(inputModuleName, pulse);

    // For a conjunction's inputs, note how many button presses it took for each input to go low
    if (pulse === Pulse.High) {
      const prev = this.inputLowPulseCycles.get(inputModuleName)!;

      this.inputLowPulseCycles.set(
        inputModuleName,
        Math.min(prev, Network.part2ButtonPresses)
      );
    }

    Network.queuedPulseSends.push(this.name);
  }

  sendPulse(): void {
    const allHigh = Array.from(this.inputs.values()).every(
      (pulse) => pulse === Pulse.High
    );

    if (allHigh) {
      this.outputs.forEach((outputModule) => {
        Network.delegatePulse(this.name, outputModule, Pulse.Low);
      });
    } else {
      this.outputs.forEach((outputModule) => {
        Network.delegatePulse(this.name, outputModule, Pulse.High);
      });
    }
  }
}

class Broadcast extends RootModule {
  private pulse: Pulse;

  constructor(name: string) {
    super(name);

    // Does not matter what the initial pulse is
    this.pulse = Pulse.Low;
  }

  lowPulseCycleLength(): number {
    return 1;
  }

  receivePulse(_inputModuleName: string, pulse: Pulse): void {
    this.pulse = pulse;
    Network.queuedPulseSends.push(this.name);
  }

  sendPulse(): void {
    this.outputs.forEach((output) => {
      Network.delegatePulse(this.name, output, this.pulse);
    });
  }
}

class Network {
  static moduleMap: Map<string, RootModule>;
  static highPulses: number;
  static lowPulses: number;
  static queuedPulseSends: string[];
  static part2ButtonPresses: number;

  private static addModule(moduleString: string): void {
    const [src, dest] = moduleString.split(" -> ");
    const shortenedName =
      src.startsWith("%") || src.startsWith("&") ? src.slice(1) : src;

    let module: RootModule;

    if (src.startsWith("%")) {
      module = new FlipFlop(shortenedName);
    } else if (src.startsWith("&")) {
      module = new Conjunction(shortenedName);
    } else {
      module = new Broadcast(shortenedName);
    }

    dest.split(", ").forEach((output) => {
      module.connectOutput(output);
    });

    this.moduleMap.set(shortenedName, module);
  }

  private static buttonPress(): void {
    this.delegatePulse("button", "broadcaster", Pulse.Low);
    this.part2ButtonPresses++;

    while (this.queuedPulseSends.length > 0) {
      const sending = _.clone(this.queuedPulseSends);
      this.queuedPulseSends = [];

      sending.forEach((moduleName) => {
        this.moduleMap.get(moduleName)!.sendPulse();
      });
    }
  }

  static initialize(moduleStrings: string[]) {
    this.moduleMap = new Map();
    this.highPulses = 0;
    this.lowPulses = 0;
    this.queuedPulseSends = [];
    this.part2ButtonPresses = 0;

    // Handle the outedges
    moduleStrings.forEach((moduleString) => {
      this.addModule(moduleString);
    });

    // Handle the inedges
    moduleStrings.forEach((moduleString) => {
      const [src, dest] = moduleString.split(" -> ");

      const shortenedName =
        src.startsWith("%") || src.startsWith("&") ? src.slice(1) : src;

      dest.split(", ").forEach((output) => {
        const receiving = this.moduleMap.get(output);

        if (receiving) {
          receiving.connectInput(shortenedName);
        }
      });
    });
  }

  static delegatePulse(
    sendingModuleName: string,
    receivingModuleName: string,
    pulse: Pulse
  ): void {
    if (pulse === Pulse.High) {
      this.highPulses++;
    } else {
      this.lowPulses++;
    }

    // If the module does not exist, do nothing
    if (!this.moduleMap.has(receivingModuleName)) {
      return;
    }

    this.moduleMap
      .get(receivingModuleName)!
      .receivePulse(sendingModuleName, pulse);
  }

  /**
   * Just very tedious simulation.
   */
  static getPart1Answer(): number {
    for (let i = 0; i < 1000; i++) {
      this.buttonPress();
    }

    return this.highPulses * this.lowPulses;
  }

  /**
   * Generalizes approach in this guy's blog:
   * https://medium.com/@jatinkrmalik/day-20-pulse-propagation-advent-of-code-2023-python-844ad63b515a
   *
   * Intuitively, the cycle lengths all need to intersect at the LCM of the button press count.
   */
  static getPart2Answer(): number {
    // Get every module that sends input to "rx"
    const rxInputs: RootModule[] = [];

    this.moduleMap.forEach((module: RootModule) => {
      if (module.outputs.includes("rx")) {
        rxInputs.push(module);
      }
    });

    // While we don't have the complete cycle information for some input module, keep button pressing
    while (
      rxInputs.every((module) => module.lowPulseCycleLength() === Infinity)
    ) {
      this.buttonPress();
    }

    // Take LCM of all input modules' cycle lengths
    return _.min(rxInputs.map((module) => module.lowPulseCycleLength()))!;
  }
}

Network.initialize(lines);
console.log(Network.getPart1Answer());

Network.initialize(lines);
console.log(Network.getPart2Answer());
