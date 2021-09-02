import { choice, seq } from "../src/combinator";
import { el, pure } from "../src/primitive";

describe("combinator", () => {
    describe("choice", () => {
        test("最初に成功した結果で成功", () => {
            const parser = choice([el(2), el(4), pure(11)]);
            expect(parser).parseResultToEqual({ succ: true, target: [4], pos: 1, value: 4 });
            expect(parser).parseResultToEqual({ succ: true, target: [], pos: 0, value: 11 });
        });
        test("いずれかが成功すれば成功", () => {
            const editors = ["Google Chrome", "Firefox", "Safari", "Opera", "Microsoft Edge"];
            const parser = choice(editors.map(el));
            for(const editor of editors) {
                expect(parser).parseResultToEqual(
                    { succ: true, target: [editor], pos: 1, value: editor },
                );
            }
            expect(parser).parseResultToEqual({ succ: false, target: ["Internet Explorer"], pos: 0 });
        });
    });
    describe("seq", () => {
        const lucasNumbers = [2, 1, 3, 4, 7];
        test("順番にパースして各パーサーの結果の配列で成功", () => {
            expect(seq(lucasNumbers.map(el))).parseResultToEqual({
                succ: true,
                target: [...lucasNumbers, 11, 18],
                pos: lucasNumbers.length,
                value: lucasNumbers,
            });
        });
        test("途中で失敗するとその時点で失敗", () => {
            expect(seq(lucasNumbers.map(el))).parseResultToEqual({
                succ: false,
                target: lucasNumbers.slice(0, -1),
                pos: lucasNumbers.length - 1,
            });
            expect(seq(lucasNumbers.map(el))).parseResultToEqual({
                succ: false,
                target: [2, 1, 4, 4, 7],
                pos: 2,
            });
        });
        test("`droppable=true`で途中で失敗してもその時点までの結果で成功", () => {
            const parser = seq([1, 1, 2, 6, 24, 120].map(el), { droppable: true });
            expect(parser).parseResultToEqual(
                { succ: true, target: [1, 1, 2, 3, 5, 8], pos: 3, value: [1, 1, 2] },
            );
            expect(parser).parseResultToEqual(
                { succ: true, target: [1, 1], pos: 2, value: [1, 1] },
            );
            expect(parser).parseResultToEqual({ succ: true, target: [], pos: 0, value: [] });
        });
    });
});
