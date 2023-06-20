import type { Source } from "./context";

export type ParseError =
    | { type: "Unknown" }
    | { type: "Expected"; value: Source };

export const unknown: ParseError = { type: "Unknown" };

export const expected = (value: Source): ParseError => ({
    type: "Expected",
    value,
});
