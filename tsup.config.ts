import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/index.ts", "./src/internal.ts"],
    format: ["cjs", "esm"],
    treeshake: "smallest",
    minifySyntax: true,
    splitting: true,
    dts: true,
    clean: true,
});
