import { el } from "../src/primitive";

describe("Parser", () => {
    describe("many", () => {
        test("min", () => {
            expect(el(1).many()).parseResultToEqual(
                { succ: true, target: [], pos: 0, value: [] },
            );
            expect(el(1).many({ min: 2 })).parseResultToEqual(
                { succ: true, target: [1, 1], pos: 2, value: [1, 1] },
            );
            expect(el(1).many({ min: 2 })).parseResultToEqual(
                { succ: false, target: [1, "1"], pos: 1 },
            );
            expect(el(1).many({ min: 2 })).parseResultToEqual(
                { succ: false, target: [1], pos: 1 },
            );
        });
        test("max", () => {
            expect(el(1).many({ max: 2 })).parseResultToEqual(
                { succ: true, target: [1, 1, 1, 1], pos: 2, value: [1, 1] },
            );
            expect(el(1).many({ max: 2 })).parseResultToEqual(
                { succ: true, target: [1], pos: 1, value: [1] },
            );
        });
        test("min <= max", () => {
            expect(el(1).many({ min: 3, max: 1 })).parseResultToEqual(
                { succ: true, target: [1, 1, 1, 1], pos: 3, value: [1, 1, 1] },
            );
        });
    });
});
