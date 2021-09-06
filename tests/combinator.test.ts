import { choice, seq } from "../src/combinator";
import { el, pure } from "../src/primitive";

describe("combinator", () => {
    describe("choice", () => {
        test("最初に成功した結果で成功", () => {
            const parser = choice([el(2), el(4), pure(11)]);
            expect(parser).parseToSucc([4], 1, 4);
            expect(parser).parseToSucc([], 0, 11);
        });
        test("いずれかが成功すれば成功", () => {
            const browsers = ["Google Chrome", "Firefox", "Safari", "Opera", "Microsoft Edge"];
            const parser = choice(browsers.map(el));
            for(const browser of browsers) {
                expect(parser).parseToSucc([browser], 1, browser);
            }
            expect(parser).parseToFail(["Internet Explorer"], 0);
        });
    });
    describe("seq", () => {
        const lucasNumbers = [2, 1, 3, 4, 7];
        test("順番にパースして各パーサーの結果の配列で成功", () => {
            expect(seq(lucasNumbers.map(el))).parseToSucc(
                [...lucasNumbers, 11, 18],
                lucasNumbers.length,
                lucasNumbers,
            );
        });
        test("途中で失敗するとその時点で失敗", () => {
            expect(seq(lucasNumbers.map(el))).parseToFail(
                lucasNumbers.slice(0, -1),
                lucasNumbers.length - 1,
            );
            expect(seq(lucasNumbers.map(el))).parseToFail([2, 1, 4, 4, 7], 2);
        });
        test("`droppable=true`で途中で失敗してもその時点までの結果で成功", () => {
            const parser = seq([1, 1, 2, 6, 24, 120].map(el), { droppable: true });
            expect(parser).parseToSucc([1, 1, 2, 3, 5, 8], 3, [1, 1, 2]);
            expect(parser).parseToSucc([1, 1], 2, [1, 1]);
            expect(parser).parseToSucc([], 0, []);
        });
    });
});
