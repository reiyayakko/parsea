import { parseA } from "parsea";
import { describe, expect, test } from "vitest";
import { SExpression } from "./s-expression";

describe("S-expression", () => {
    test("Hello world!", () => {
        expect(parseA(SExpression, '(print "Hello world!")')).toEqual([
            "print",
            '"Hello world!"',
        ]);
    });
    test("quote list", () => {
        expect(parseA(SExpression, "'(1 2 3 4)")).toEqual(["quote", "1", "2", "3", "4"]);
    });
});
