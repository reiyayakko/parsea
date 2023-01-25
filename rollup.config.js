// @ts-check

import ts from "rollup-plugin-ts";

const DEV = process.env.BUILD === "development";

/** @type {import("rollup").RollupOptions} */
const config = {
    input: "./src/index.ts",
    output: [
        { file: "dist/parsea.esm.js", format: "esm" },
        { file: "dist/parsea.cjs.js", format: "cjs" },
    ],
    external: "emnorst",
    plugins: [
        ts({ transpileOnly: DEV }),
    ],
};

export default config;
