import { describe, expect, jest, test } from "@jest/globals";
import { label } from "./error";
import type { Parser } from "./parser";
import { fail, literal, pure } from "./primitive";

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

    describe("option", () => {
        test("success", () => {
            expect(fail().option("some default value").parse([])).toMatchObject({
                success: true,
                value: "some default value",
            });
        });

        test("default", () => {
            expect(fail().option().parse([])).toMatchObject({
                success: true,
                value: undefined,
            });
        });
    });
});
