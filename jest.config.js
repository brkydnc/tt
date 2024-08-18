/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  verbose: true,
  collectCoverage: true,
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
