import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["{src,examples}/**/*.test.ts"],
        includeSource: ["examples/*.ts"],
        alias: {
            parsea: `${import.meta.dirname}/src`,
        },
        coverage: {
            include: ["src"],
        },
    },
});
