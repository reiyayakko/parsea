import type { Source } from "./context";

export type ParseError =
    | { type: "Expected"; value: Source }
    | { type: "Label"; name: string; length: number };

export const expected = (value: Source): ParseError => ({
    type: "Expected",
    value,
});

export const label = (name: string, length = 0): ParseError => ({
    type: "Label",
    name,
    length,
});
