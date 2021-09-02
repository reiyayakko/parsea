/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// @ts-check

/** @type {import("@jest/types").Config.InitialOptions} */
const config = {
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    setupFilesAfterEnv: ["./tests/setup.ts"],
    transform: { "\\.ts$": "esbuild-jest" },
};

module.exports = config;
