import { describe, test, expect, jest } from "@jest/globals";
import { el, pure } from "./primitive";
import type { Parser } from "./parser";

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
        expect(result?.v).toBe("hoge");
    });
    test("flatMap", () => {
        const fn = jest.fn<() => Parser<string>>().mockReturnValue(pure("hoge"));
        const result = pure(null).flatMap(fn).parse([]);
        expect(fn).lastCalledWith(null, {});
        expect(result?.v).toBe("hoge");
    });
    describe("many", () => {
        test("min", () => {
            expect(el(1).many().parse([])).toEqual({ i: 0, v: [] });

            const parser = el(1).many({ min: 2 });
            expect(parser.parse([1, 1])).toEqual({ i: 2, v: [1, 1] });
            expect(parser.parse([1, "1"])).toBeNull();
            expect(parser.parse([1])).toBeNull();
        });
        test("max", () => {
            const parser = el(1).many({ max: 2 });
            expect(parser.parse([1, 1, 1, 1])).toEqual({ i: 2, v: [1, 1] });
            expect(parser.parse([1])).toEqual({ i: 1, v: [1] });
        });
        test("min <= max", () => {
            const parser = el(1).many({ min: 3, max: 1 });
            expect(parser.parse([1, 1, 1, 1])).toEqual({ i: 3, v: [1, 1, 1] });
        });
    });
});
