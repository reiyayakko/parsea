import { choice, seq } from "../src/combinator";
import { el, pure } from "../src/primitive";

describe("combinator", () => {
    describe("choice", () => {
        test("最初に成功した結果で成功", () => {
            const parser = choice([el(2), el(4), pure(11)]);
            expect(parser.parse([4])).toEqual({ pos: 1, val: 4 });
            expect(parser.parse([])).toEqual({ pos: 0, val: 11 });
        });
        test("いずれかが成功すれば成功", () => {
            const browsers = [
                "Google Chrome",
                "Firefox",
                "Safari",
                "Opera",
                "Microsoft Edge",
            ];
            const parser = choice(browsers.map(el));
            for (const browser of browsers) {
                expect(parser.parse([browser])).toEqual({ pos: 1, val: browser });
            }
            expect(parser.parse(["Internet Explorer"])).toBeNull();
        });
    });
    describe("seq", () => {
        const lucasNumbers = [2, 1, 3, 4, 7];
        const lucasNumberParser = seq(lucasNumbers.map(el));
        test("順番にパースして各パーサーの結果の配列で成功", () => {
            expect(lucasNumberParser.parse([...lucasNumbers, 11, 18])).toEqual({
                pos: lucasNumbers.length,
                val: lucasNumbers,
            });
        });
        test("途中で失敗するとその時点で失敗", () => {
            expect(lucasNumberParser.parse(lucasNumbers.slice(0, -1))).toBeNull();
            expect(lucasNumberParser.parse([2, 1, 4, 4, 7])).toBeNull();
        });
        test("`droppable=true`で途中で失敗してもその時点までの結果で成功", () => {
            const parser = seq([1, 1, 2, 6, 24, 120].map(el), { droppable: true });
            expect(parser.parse([1, 1, 2, 3, 5, 8])).toEqual({ pos: 3, val: [1, 1, 2] });
            expect(parser.parse([1, 1])).toEqual({ pos: 2, val: [1, 1] });
            expect(parser.parse([])).toEqual({ pos: 0, val: [] });
        });
    });
});
