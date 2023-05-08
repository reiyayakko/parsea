import { describe, test, expect } from "@jest/globals";
import { isInt32 } from "emnorst";
import { satisfy } from "./primitive";
import { qo } from "./do";

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
        expect(parser.parse([5, "*"])).toEqual({ i: 2, v: { a: 5, b: "*" } });
        expect(parser.parse([20, 5])).toBeNull();
    });
});
