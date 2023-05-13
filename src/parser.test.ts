import { describe, expect, jest, test } from "@jest/globals";
import type { Parser } from "./parser";
import { el, pure } from "./primitive";

describe("Parser", () => {
    test("parseにArrayLike以外を入れるとエラー", () => {
        expect(() => {
            pure(null).parse({ length: NaN });
        }).toThrow(TypeError);
    });
    test("map", () => {
        const fn = jest.fn<() => string>().mockReturnValue("hoge");
        const result = pure(null).map(fn).parse([]);
        expect(fn).lastCalledWith(null, {});
        expect(result).toHaveProperty("value", "hoge");
    });
    test("flatMap", () => {
        const fn = jest.fn<() => Parser<string>>().mockReturnValue(pure("hoge"));
        const result = pure(null).flatMap(fn).parse([]);
        expect(fn).lastCalledWith(null, {});
        expect(result).toHaveProperty("value", "hoge");
    });
    describe("many", () => {
        test("empty", () => {
            expect(el(1).many().parse([])).toHaveProperty("value", []);
        });
        test("min", () => {
            const parser = el(1).many({ min: 2 });
            expect(parser.parse([1, 1])).toHaveProperty("value", [1, 1]);
            expect(parser.parse([1, "1"])).toHaveProperty("success", false);
            expect(parser.parse([1])).toHaveProperty("success", false);
        });
        test("max", () => {
            const parser = el(1).many({ max: 2 });
            expect(parser.parse([1, 1, 1, 1])).toHaveProperty("value", [1, 1]);
            expect(parser.parse([1])).toHaveProperty("value", [1]);
        });
        test("min > max", () => {
            const parser = el(1).many({ min: 3, max: 1 });
            expect(parser.parse([1, 1, 1, 1])).toHaveProperty("value", [1, 1, 1]);
        });
    });
});
