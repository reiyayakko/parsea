// @ts-check

import { defineConfig } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";

/** @type {(fileNames: string) => import("rollup").OutputOptions} */
const output = fileNames => ({
    dir: "dist",
    manualChunks: {
        internal: ["./src/internal.ts"],
    },
    entryFileNames: fileNames,
    chunkFileNames: fileNames,
    minifyInternalExports: false,
});

export default defineConfig([
    {
        input: "./src/index.ts",
        output: [
            { ...output("[name].[format].js"), format: "es" },
            { ...output("[name].[format].js"), format: "cjs" },
        ],
        external: "emnorst",
        plugins: [esbuild()],
    },
    {
        input: "./src/index.ts",
        output: output("[name].d.ts"),
        plugins: [dts()],
    },
]);
