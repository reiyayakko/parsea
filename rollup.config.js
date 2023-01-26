// @ts-check

import { defineConfig } from "rollup";
import ts from "rollup-plugin-ts";

const DEV = process.env.BUILD === "development";

export default defineConfig({
    input: "./src/index.ts",
    output: [
        { file: "dist/parsea.esm.js", format: "esm" },
        { file: "dist/parsea.cjs.js", format: "cjs" },
    ],
    external: "emnorst",
    plugins: [ts({ transpileOnly: DEV })],
});
