import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/index.ts", "./src/internal.ts"],
    format: ["cjs", "esm"],
    treeshake: "smallest",
    splitting: true,
    dts: true,
    clean: true,
});
