// @ts-check

import ts from "@wessberg/rollup-plugin-ts";
import pkg from "./package.json";

const DEV = process.env.BUILD === "development";
const banner = `
/**
 * @license
 * parsea v${pkg.version}
 * Copyright 2021 reiyayakko
 * License MIT
 */
`;

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "./src/index.ts",
    output: [
        { file: "dist/parsea.esm.js", format: "esm", banner },
        { file: "dist/parsea.cjs.js", format: "cjs", banner },
    ],
    external: "emnorst",
    plugins: [
        ts({ transpileOnly: DEV }),
    ],
};

export default config;
