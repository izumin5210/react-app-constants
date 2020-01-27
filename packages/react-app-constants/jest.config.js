module.exports = {
  ...require("../../jest.config"),
  testEnvironment: "jest-environment-jsdom-fourteen",
  globals: {
    "ts-jest": {
      tsConfig: "./tsconfig.test.json",
    },
  },
};
