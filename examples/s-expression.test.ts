import { describe, expect, test } from "@jest/globals";
import { EOI } from "../src";
import { SExpression } from "./s-expression";

describe("S-expression", () => {
    test("Hello world!", () => {
        const source = '(print "Hello world!")';
        expect(SExpression.skip(EOI).parse(source)).toEqual({
            success: true,
            index: expect.any(Number),
            value: ["print", '"Hello world!"'],
        });
    });
    test("quote list", () => {
        const source = "'(1 2 3 4)";
        expect(SExpression.skip(EOI).parse(source)).toEqual({
            success: true,
            index: expect.any(Number),
            value: ["quote", "1", "2", "3", "4"],
        });
    });
});
