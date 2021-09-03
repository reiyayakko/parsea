import { el } from "../src/primitive";

describe("Parser", () => {
    describe("many", () => {
        test("min", () => {
            expect(el(1).many()).parseToSucc([], 0, []);

            const parser = el(1).many({ min: 2 });
            expect(parser).parseToSucc([1, 1], 2, [1, 1]);
            expect(parser).parseToFail([1, "1"], 1);
            expect(parser).parseToFail([1], 1);
        });
        test("max", () => {
            const parser = el(1).many({ max: 2 });
            expect(parser).parseToSucc([1, 1, 1, 1], 2, [1, 1]);
            expect(parser).parseToSucc([1], 1, [1]);
        });
        test("min <= max", () => {
            expect(el(1).many({ min: 3, max: 1 })).parseToSucc([1, 1, 1, 1], 3, [1, 1, 1]);
        });
    });
});
