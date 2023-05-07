/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

// @ts-check

/** @type {import("@jest/types").Config.InitialOptions} */
export default {
    roots: ["<rootDir>/src/"],
    collectCoverageFrom: ["src/**/*.ts"],
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    transform: {
        "\\.ts$": ["@swc/jest", { sourceMaps: true }],
    },
};
