import {
  getString,
  log,
  header,
  getRunner,
  Test,
  Range,
} from './helper';

import {
  Mutator,
} from './impl';

import { green, red } from 'chalk';

import dedent from 'dedent-js';

// Mutant
export class Mutant {
  id: number;
  type: MutantType;
  code: string;
  runner: (...args: any[]) => any;
  orig: string;
  range: Range;
  after: string;

  constructor(
    id: number,
    type: MutantType,
    code: string,
    orig: string,
    range: Range,
    after: string,
  ) {
    this.id = id;
    this.type = type;
    this.code = code;
    this.runner = getRunner(code);
    this.orig = orig;
    this.range = range;
    this.after = after;
  }

  // Conversion to string
  toString = (): string => {
    const { id, type, orig, range, after } = this;
    const { start, end } = range;
    let before = dedent(orig.substring(start.index, end.index));
    const MAX_LEN = 50;
    if (before.length > MAX_LEN) switch (type) {
      case MutantType.BlockStmt:
      case MutantType.ObjectLiteral:
        before = '{ ... }';
        break;
    }
    return `Mutant #${id} [${type}] [${range}] \`${before}\` -> \`${after}\``;
  }
}

// Mutant type
export enum MutantType {
  Arithmetic = 'arith',
  ArrayDecl = 'array',
  AssignExpr = 'assign',
  BlockStmt = 'block',
  BooleanLiteral = 'bool',
  Cond = 'cond',
  EqualityOp = 'equal',
  LogicalOp = 'logical',
  ObjectLiteral = 'object',
  OptionalChain = 'opt-chain',
  StringLiteral = 'string',
  UnaryOp = 'unary',
  Update = 'update',
}

// All mutant types
export const allMutantTypes = Object.values(MutantType).sort();

// Mutation tester
export class MutationTester {
  code: string;
  runner: (...args: any[]) => any;
  mutants: Mutant[];
  detail: boolean;

  constructor(code: string, detail: boolean = false) {
    this.code = code;
    this.runner = getRunner(code);
    this.mutants = Mutator.from(code, detail)
    this.detail = detail;
  }

  // Run the all mutants
  run = (inputs: any[][]): MutationScore => {
    const { mutants, runner, isKilled, detail } = this;
    const score = new MutationScore(mutants);
    const tests = inputs.map(input => ({ input, expected: runner(input) }));
    if (detail) {
      header('Test cases inferred from the inputs');
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        log(`Test #${i+1}: ${getString(test)}`);
      }
      header('Killed or Alive Mutants');
    }
    for (const mutant of mutants) {
      if (isKilled(mutant, tests)) {
        score.add(mutant);
      }
    }
    return score;
  }

  // Check if the mutant is killed by the test
  isKilled = (mutant: Mutant, tests: Test[]): boolean => {
    const { detail } = this;
    for (const test of tests) {
      const { input, expected } = test;
      const result = mutant.runner(input);
      const killed = result != expected;
      if (killed) {
        if (detail) {
          log(`[KILLED] ${mutant}`, green);
          log(`         Test is ${getString(test)} but got ${getString(result)}`);
        }
        return true;
      }
    }
    if (detail) log(`[ALIVE ] ${mutant}`, red);
    return false;
  }
}

// Kill counter
export interface KillCounter {
  killed: number;
  total: number;
}

// Mutation score
export class MutationScore {
  counters: Map<MutantType, KillCounter>;
  killed: number;
  total: number;

  constructor(mutants: Mutant[]) {
    this.counters = new Map();
    this.killed = 0;
    this.total = 0;
    for (const mutant of mutants) {
      const counter = this.getCounter(mutant.type);
      counter.total++;
      this.total++;
    }
  }

  static fromCounters = (
    counters: Map<MutantType, KillCounter>
  ): MutationScore => {
    const score = new MutationScore([]);
    score.counters = counters;
    for (const counter of counters.values()) {
      score.killed += counter.killed;
      score.total += counter.total;
    }
    return score;
  }

  // Equality check
  equals = (that: MutationScore): boolean => {
    for (const type of allMutantTypes) {
      const thisCounter = this.getCounter(type);
      const thatCounter = that.getCounter(type);
      if (thisCounter.killed != thatCounter.killed) return false;
      if (thisCounter.total != thatCounter.total) return false;
    }
    return true;
  }

  // Add the mutant to the score
  add = (mutant: Mutant): void => {
    this.killed++;
    this.getCounter(mutant.type).killed++;
  }

  // Conversion to string
  toString = (detail: boolean = true): string => {
    const { killed, total } = this;
    const ratio = (killed / total) * 100;
    let str = `${killed} / ${total} (${ratio.toFixed(2)}%)`;
    if (detail) for (const type of allMutantTypes) {
      const counter = this.getCounter(type);
      if (counter.total > 0) {
        const { killed, total } = counter;
        const ratio = (killed / total) * 100;
        const typeStr = type.padEnd(10);
        const killedStr = killed.toString().padStart(3);
        const totalStr = total.toString().padStart(3);
        str += `\n  [${typeStr}]: ${killedStr} / ${totalStr}`
      }
    }
    return str;
  }

  getCounter(type: MutantType): KillCounter {
    let counter = this.counters.get(type)
    if (!counter) {
      counter = { killed: 0, total: 0 };
      this.counters.set(type, counter);
    }
    return counter;
  }
}
