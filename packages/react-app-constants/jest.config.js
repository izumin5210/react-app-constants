module.exports = {
  ...require("../../jest.config"),
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testEnvironment: "jest-environment-jsdom-fourteen",
};
