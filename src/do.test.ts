import { describe, expect, test } from "@jest/globals";
import { isInt32 } from "emnorst";
import { qo } from "./do";
import { Parser } from "./parser";
import { ANY_EL, fail, satisfy } from "./primitive";

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
        expect.assertions(2);
        qo(perform => {
            perform.try(() => {
                expect(perform(ANY_EL)).toBe("hoge");
                perform(fail());
            });
            perform(
                new Parser(state => {
                    expect(state).toHaveProperty("i", 0);
                    return null;
                }),
            );
        }).parse(["hoge"]);
    });
    test("try allowPartialCommit", () => {
        expect.assertions(2);
        qo(perform => {
            perform.try(() => {
                expect(perform(ANY_EL)).toBe("hoge");
                perform(fail());
            }, true);
            perform(
                new Parser(state => {
                    expect(state).toHaveProperty("i", 1);
                    return null;
                }),
            );
        }).parse(["hoge"]);
    });
});
