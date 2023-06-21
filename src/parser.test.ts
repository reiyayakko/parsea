import { describe, expect, jest, test } from "@jest/globals";
import type { Parser } from "./parser";
import { literal, pure } from "./primitive";
import { label } from "./error";

describe("Parser", () => {
    test("label", () => {
        expect(literal("hoge").label("label").parse([])).toEqual({
            success: false,
            index: 0,
            errors: [label("label", 1)],
        });
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
