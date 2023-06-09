import { describe, expect, test } from "@jest/globals";
import { choice, many, seq } from "./combinator";
import { el, pure } from "./primitive";

describe("choice", () => {
    test("最初に成功した結果で成功", () => {
        const parser = choice([el(2), el(4), pure(11)]);
        expect(parser.parse([4])).toHaveProperty("value", 4);
        expect(parser.parse([])).toHaveProperty("value", 11);
    });
    test("いずれかが成功すれば成功", () => {
        const browsers = ["Google Chrome", "Firefox", "Safari", "Microsoft Edge"];
        const parser = choice(browsers.map(el));
        for (const browser of browsers) {
            expect(parser.parse([browser])).toHaveProperty("value", browser);
        }
        expect(parser.parse(["Internet Explorer"])).toHaveProperty("success", false);
    });
});

describe("seq", () => {
    const lucasNumbers = [2, 1, 3, 4, 7];
    const lucasNumberParser = seq(lucasNumbers.map(el));
    test("順番にパースして各パーサーの結果の配列で成功", () => {
        const result = lucasNumberParser.parse([...lucasNumbers, 11, 18]);
        expect(result).toHaveProperty("value", lucasNumbers);
    });
    test("途中で失敗するとその時点で失敗", () => {
        const result = lucasNumberParser.parse([2, 1, 4, 4, 7]);
        expect(result).toHaveProperty("success", false);
    });
    test("allowPartialで途中で失敗してもその時点までの結果で成功", () => {
        const parser = seq([1, 1, 2, 6, 24, 120].map(el), { allowPartial: true });
        expect(parser.parse([1, 1, 2, 3, 5, 8])).toEqual({
            success: true,
            index: 3,
            value: [1, 1, 2],
        });
        expect(parser.parse([1, 1])).toEqual({
            success: true,
            index: 2,
            value: [1, 1],
        });
        expect(parser.parse([])).toHaveProperty("value", []);
    });
});

describe("many", () => {
    test("empty", () => {
        expect(many(el(1)).parse([])).toHaveProperty("value", []);
    });
    test("min", () => {
        const parser = many(el(1), { min: 2 });
        expect(parser.parse([1, 1])).toHaveProperty("value", [1, 1]);
        expect(parser.parse([1, "1"])).toHaveProperty("success", false);
        expect(parser.parse([1])).toHaveProperty("success", false);
    });
    test("max", () => {
        const parser = many(el(1), { max: 2 });
        expect(parser.parse([1, 1, 1, 1])).toHaveProperty("value", [1, 1]);
        expect(parser.parse([1])).toHaveProperty("value", [1]);
    });
    test("min > max", () => {
        const parser = many(el(1), { min: 3, max: 1 });
        expect(parser.parse([1, 1, 1, 1])).toHaveProperty("value", [1, 1, 1]);
    });
});
