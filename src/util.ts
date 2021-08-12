export const clamp = (x: number, lower: number, upper: number): number =>
    Math.min(Math.max(x, lower), upper);
