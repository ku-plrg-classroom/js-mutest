import assert from 'assert';

import {
  readFile,
  readJSON,
  TodoError,
} from '../src/helper';

import {
  KillCounter,
  MutantType,
  MutationScore,
  MutationTester,
} from '../src/tester';

import {
  Mutator,
  vectorInputs,
} from '../src/impl';

const {
  Arithmetic,
  ArrayDecl,
  AssignExpr,
  BlockStmt,
  BooleanLiteral,
  Cond,
  EqualityOp,
  LogicalOp,
  ObjectLiteral,
  OptionalChain,
  StringLiteral,
  UnaryOp,
  Update,
} = MutantType;

const expectedMaps: {
  [name: string]: [MutantType, KillCounter][]
} = {
  "arith": {
    "arith-1": [
      [Arithmetic,      { killed: 0,    total: 8 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
    "arith-2": [
      [Arithmetic,      { killed: 4,    total: 8 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
    "arith-3": [
      [Arithmetic,      { killed: 8,    total: 8 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
  },
  "array": {
    "array-1": [
      [Arithmetic,      { killed: 0,    total: 4 }],
      [ArrayDecl,       { killed: 0,    total: 2 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
    "array-2": [
      [Arithmetic,      { killed: 2,    total: 4 }],
      [ArrayDecl,       { killed: 1,    total: 2 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
    "array-3": [
      [Arithmetic,      { killed: 4,    total: 4 }],
      [ArrayDecl,       { killed: 2,    total: 2 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
  },
  "assign": {
    "assign-1": [
      [AssignExpr,      { killed: 2,    total: 10 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
    "assign-2": [
      [AssignExpr,      { killed: 4,    total: 10 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
    "assign-3": [
      [AssignExpr,      { killed: 10,    total: 10 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
    ],
  },
  "block": {
    "block-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 3,    total: 4 }],
      [Cond,            { killed: 1,    total: 2 }],
      [EqualityOp,      { killed: 0,    total: 2 }],
      [Update,          { killed: 0,    total: 4 }],
    ],
    "block-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 4,    total: 4 }],
      [Cond,            { killed: 1,    total: 2 }],
      [EqualityOp,      { killed: 1,    total: 2 }],
      [Update,          { killed: 4,    total: 4 }],
    ],
    "block-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 4,    total: 4 }],
      [Cond,            { killed: 2,    total: 2 }],
      [EqualityOp,      { killed: 2,    total: 2 }],
      [Update,          { killed: 4,    total: 4 }],
    ],
  },
  "bool": {
    "bool-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [BooleanLiteral,  { killed: 4,    total: 6 }],
      [Cond,            { killed: 2,    total: 2 }],
      [LogicalOp,       { killed: 3,    total: 8 }],
    ],
    "bool-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [BooleanLiteral,  { killed: 4,    total: 6 }],
      [Cond,            { killed: 0,    total: 2 }],
      [LogicalOp,       { killed: 6,    total: 8 }],
    ],
    "bool-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [BooleanLiteral,  { killed: 6,    total: 6 }],
      [Cond,            { killed: 2,    total: 2 }],
      [LogicalOp,       { killed: 6,    total: 8 }],
    ],
  },
  "chain": {
    "chain-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [OptionalChain,   { killed: 0,    total: 5 }],
      [StringLiteral,   { killed: 0,    total: 2 }],
    ],
    "chain-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [OptionalChain,   { killed: 2,    total: 5 }],
      [StringLiteral,   { killed: 0,    total: 2 }],
    ],
    "chain-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [OptionalChain,   { killed: 5,    total: 5 }],
      [StringLiteral,   { killed: 0,    total: 2 }],
    ],
  },
  "cond": {
    "cond-1": [
      [Arithmetic,      { killed: 2,    total: 2 }],
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [Cond,            { killed: 3,    total: 7 }],
      [EqualityOp,      { killed: 3,    total: 10 }],
      [LogicalOp,       { killed: 1,    total: 2 }],
      [Update,          { killed: 1,    total: 2 }],
    ],
    "cond-2": [
      [Arithmetic,      { killed: 2,    total: 2 }],
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [Cond,            { killed: 5,    total: 7 }],
      [EqualityOp,      { killed: 5,    total: 10 }],
      [LogicalOp,       { killed: 1,    total: 2 }],
      [Update,          { killed: 1,    total: 2 }],
    ],
    "cond-3": [
      [Arithmetic,      { killed: 2,    total: 2 }],
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [Cond,            { killed: 7,    total: 7 }],
      [EqualityOp,      { killed: 9,    total: 10 }],
      [LogicalOp,       { killed: 2,    total: 2 }],
      [Update,          { killed: 1,    total: 2 }],
    ],
  },
  "equal": {
    "equal-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [EqualityOp,      { killed: 8,    total: 16 }],
    ],
    "equal-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [EqualityOp,      { killed: 12,   total: 16 }],
    ],
    "equal-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [EqualityOp,      { killed: 16,   total: 16 }],
    ],
  },
  "logical": {
    "logical-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [LogicalOp,       { killed: 0,    total: 6 }],
    ],
    "logical-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [LogicalOp,       { killed: 4,    total: 6 }],
    ],
    "logical-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [LogicalOp,       { killed: 6,    total: 6 }],
    ],
  },
  "object": {
    "object-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [ObjectLiteral,   { killed: 0,    total: 2 }],
    ],
    "object-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [ObjectLiteral,   { killed: 1,    total: 2 }],
    ],
    "object-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [ObjectLiteral,   { killed: 2,    total: 2 }],
    ],
  },
  "string": {
    "string-1": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [EqualityOp,      { killed: 6,    total: 12 }],
      [StringLiteral,   { killed: 3,    total: 6 }],
    ],
    "string-2": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [EqualityOp,      { killed: 6,    total: 12 }],
      [StringLiteral,   { killed: 6,    total: 6 }],
    ],
    "string-3": [
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [EqualityOp,      { killed: 12,   total: 12 }],
      [StringLiteral,   { killed: 6,    total: 6 }],
    ],
  },
  "unary": {
    "unary-1": [
      [Arithmetic,      { killed: 0,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [UnaryOp,         { killed: 1,    total: 2 }],
    ],
    "unary-2": [
      [Arithmetic,      { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [UnaryOp,         { killed: 1,    total: 2 }],
    ],
    "unary-3": [
      [Arithmetic,      { killed: 1,    total: 1 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [UnaryOp,         { killed: 2,    total: 2 }],
    ],
  },
  "update": {
    "update-1": [
      [ArrayDecl,       { killed: 3,    total: 3 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [Update,          { killed: 0,    total: 8 }],
    ],
    "update-2": [
      [ArrayDecl,       { killed: 3,    total: 3 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [Update,          { killed: 4,    total: 8 }],
    ],
    "update-3": [
      [ArrayDecl,       { killed: 3,    total: 3 }],
      [BlockStmt,       { killed: 1,    total: 1 }],
      [Update,          { killed: 8,    total: 8 }],
    ],
  },
  "vector": {
    "vector": [
      [Arithmetic,      { killed: 29,   total: 50 }],
      [ArrayDecl,       { killed: 1,    total: 1 }],
      [AssignExpr,      { killed: 2,    total: 5 }],
      [BlockStmt,       { killed: 15,   total: 45 }],
      [BooleanLiteral,  { killed: 1,    total: 3 }],
      [Cond,            { killed: 11,   total: 35 }],
      [EqualityOp,      { killed: 8,    total: 36 }],
      [LogicalOp,       { killed: 6,    total: 22 }],
      [ObjectLiteral,   { killed: 1,    total: 1 }],
      [OptionalChain,   { killed: 1,    total: 7 }],
      [StringLiteral,   { killed: 1,    total: 4 }],
      [UnaryOp,         { killed: 0,    total: 2 }],
      [Update,          { killed: 8,    total: 10 }],
    ],
  },
};

function readInputs(name: string) {
  return readJSON(`input/${name}.json`);
}

function getScore(target: string, inputs: any[][], detail: boolean = false) {
  const code = readFile(`example/${target}.js`);
  const tester = new MutationTester(code, detail);
  return tester.run(inputs);
}

function check(target: string) {
  describe(`${target}.js`, () => {
    const expectedMap = expectedMaps[target];
    for (const name in expectedMap) {
      it(`should return the correct mutation score for ${name}.json`, () => {
        try {
          const counter = new Map(expectedMap[name]);
          const expected = MutationScore.fromCounters(counter);
          const score = getScore(target, readInputs(name));
          assert.equal(expected.toString(), score.toString());
        } catch(e) {
          if (typeof e === 'string') assert.fail(e);
          else throw e;
        }
      })
    }
  });
}

describe('mutation testing', () => {
  for (const target in expectedMaps) {
    check(target);
  }
});

describe('vectorInputs', () => {
  it(`should have the perfect mutation score for vector.js`, () => {
    const { killed, total } = getScore('vector', vectorInputs);
    assert.equal(killed, total);
  })
});
