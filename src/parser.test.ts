import { describe, expect, jest, test } from "@jest/globals";
import type { Parser } from "./parser";
import { pure } from "./primitive";

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
});
