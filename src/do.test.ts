import { describe, expect, test } from "@jest/globals";
import { isInt32 } from "emnorst";
import { qo } from "./do";
import { anyEl, fail, satisfy } from "./primitive";

describe("qo", () => {
    test("error", () => {
        const parser = qo(() => {
            throw null;
        });
        expect(() => {
            parser.parse([]);
        }).toThrow();
    });
    test("do", () => {
        const parser = qo(perform => {
            const a = perform(satisfy<number>(isInt32));
            const b = perform(satisfy<string>(el => typeof el === "string"));
            return { a, b };
        });
        expect(parser.parse([5, "*"])).toEqual({
            success: true,
            index: 2,
            value: { a: 5, b: "*" },
        });
        expect(parser.parse([20, 5])).toHaveProperty("success", false);
    });
    test("try", () => {
        const parser = qo(perform => {
            perform.try(undefined, () => {
                perform(anyEl);
                perform(fail());
            });
        });
        expect(parser.parse(["hoge"])).toEqual({
            success: true,
            index: 0,
            value: undefined,
        });
    });
    test("try + allowPartial", () => {
        const parser = qo(perform => {
            perform.try(undefined, () => {
                perform(anyEl);
                perform(fail(), { allowPartial: true });
            });
        });
        expect(parser.parse(["hoge"])).toEqual({
            success: true,
            index: 1,
            value: undefined,
        });
    });
    test("while", () => {
        const parser = qo(perform => {
            const result: unknown[] = [];
            perform.while(() => {
                result.push(perform(anyEl));
            });
            return result;
        });
        expect(parser.parse([0, 1, 2, 3])).toEqual({
            success: true,
            index: 4,
            value: [0, 1, 2, 3],
        });
    });
    test("while + allowPartial", () => {
        const parser = qo(perform => {
            const result: unknown[] = [];
            perform.while(() => {
                result.push(perform(anyEl));
                perform(anyEl, { allowPartial: true });
            });
            return result;
        });
        expect(parser.parse(["hoge"])).toEqual({
            success: true,
            index: 1,
            value: ["hoge"],
        });
    });
});
