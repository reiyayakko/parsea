export type ParseError = { type: "Unknown"; index: number };

export const unknown = (index: number): ParseError => ({
    type: "Unknown",
    index,
});
