/** @type {import('jest').Config} */
const config = {
  preset: "react-native",
  verbose: false,
  setupFiles: ["<rootDir>/setup-tests.js"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      lines: 90,
      statements: 90,
    },
  },
  collectCoverageFrom: [
    "<rootDir>/src/context/stepup-context.ts",
    "<rootDir>/src/service/stepup-service.ts",
  ],
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "<rootDir>/node_modules/(?!@ngrx|(?!deck.gl)|ng-dynamic|react-native|react-navigation|react-navigation-redux-helpers|@react-navigation/.*)",
  ],
};

module.exports = config;
