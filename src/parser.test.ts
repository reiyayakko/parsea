import { el } from "./primitive";

describe("Parser", () => {
    describe("many", () => {
        test("min", () => {
            expect(el(1).many().parse([])).toEqual({ pos: 0, val: [] });

            const parser = el(1).many({ min: 2 });
            expect(parser.parse([1, 1])).toEqual({ pos: 2, val: [1, 1] });
            expect(parser.parse([1, "1"])).toBeNull();
            expect(parser.parse([1])).toBeNull();
        });
        test("max", () => {
            const parser = el(1).many({ max: 2 });
            expect(parser.parse([1, 1, 1, 1])).toEqual({ pos: 2, val: [1, 1] });
            expect(parser.parse([1])).toEqual({ pos: 1, val: [1] });
        });
        test("min <= max", () => {
            expect(el(1).many({ min: 3, max: 1 }).parse([1, 1, 1, 1])).toEqual({
                pos: 3,
                val: [1, 1, 1],
            });
        });
    });
});
