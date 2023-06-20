import type { Source } from "./context";

export type ParseError =
    | { type: "Unknown" }
    | { type: "Expected"; value: Source }
    | { type: "Label"; name: string; length: number };

export const unknown: ParseError = { type: "Unknown" };

export const expected = (value: Source): ParseError => ({
    type: "Expected",
    value,
});

export const label = (name: string, length = 0): ParseError => ({
    type: "Label",
    name,
    length,
});
