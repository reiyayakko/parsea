import { parseA } from "parsea";
import { describe, expect, test } from "vitest";
import { expr, stmt } from "./script";

describe("stmt", () => {
    test("Let", () => {
        expect(parseA(stmt, "let hoge = 0;")).toEqual({
            type: "Let",
            name: "hoge",
            init: { type: "Number", value: 0 },
        });
    });

    test("DefFn", () => {
        expect(parseA(stmt, "fn main(arg) {};")).toEqual({
            type: "DefFn",
            name: "main",
            params: ["arg"],
            body: { type: "Block", stmts: [], last: null },
        });
    });

    test("Return", () => {
        expect(parseA(stmt, "return;")).toEqual({
            type: "Return",
            body: null,
        });
    });

    test("While", () => {
        expect(parseA(stmt, "while (false) {};")).toEqual({
            type: "While",
            test: { type: "Bool", value: false },
            body: { type: "Block", stmts: [], last: null },
        });
    });

    test("Break", () => {
        expect(parseA(stmt, "break;")).toEqual({
            type: "Break",
        });
    });

    test("Expr", () => {
        expect(parseA(stmt, "0;")).toEqual({
            type: "Expr",
            expr: { type: "Number", value: 0 },
        });
    });
});

describe("expr", () => {
    describe("Bool", () => {
        test.each([true, false])("%s", value => {
            expect(parseA(expr, String(value))).toEqual({
                type: "Bool",
                value,
            });
        });
    });

    describe("Number", () => {
        test.each([
            ["int", "42", 42],
            ["minus float", "-273.25", -273.25],
        ])("%s (%f)", (_, src, value) => {
            expect(parseA(expr, src)).toEqual({
                type: "Number",
                value,
            });
        });
    });

    test("String", () => {
        expect(parseA(expr, `"Hello world!"`)).toEqual({
            type: "String",
            value: "Hello world!",
        });
    });

    test("Ident", () => {
        expect(parseA(expr, "hoge")).toEqual({
            type: "Ident",
            name: "hoge",
        });
    });

    describe("Tuple", () => {
        test("empty", () => {
            expect(parseA(expr, "()")).toEqual({
                type: "Tuple",
                elements: [],
            });
        });
        test("elements", () => {
            expect(parseA(expr, `(0, "", hoge)`)).toEqual({
                type: "Tuple",
                elements: [
                    { type: "Number", value: 0 },
                    { type: "String", value: "" },
                    { type: "Ident", name: "hoge" },
                ],
            });
        });
        test("trailing comma", () => {
            expect(parseA(expr, "(0, )")).toEqual({
                type: "Tuple",
                elements: [{ type: "Number", value: 0 }],
            });
        });
    });

    describe("Block", () => {
        test("empty", () => {
            expect(parseA(expr, "{}")).toEqual({
                type: "Block",
                stmts: [],
                last: null,
            });
        });
        test("stmts", () => {
            expect(parseA(expr, "{ 0; }")).toEqual({
                type: "Block",
                stmts: [{ type: "Expr", expr: { type: "Number", value: 0 } }],
                last: null,
            });
        });
        test("expr", () => {
            expect(parseA(expr, "{ 0 }")).toEqual({
                type: "Block",
                stmts: [],
                last: { type: "Number", value: 0 },
            });
        });
    });

    describe("If", () => {
        test("then only", () => {
            expect(parseA(expr, "if (true) {}")).toEqual({
                type: "If",
                test: { type: "Bool", value: true },
                then: { type: "Block", stmts: [], last: null },
                else: null,
            });
        });
        test("with else", () => {
            expect(parseA(expr, "if (true) 1 else 0")).toEqual({
                type: "If",
                test: { type: "Bool", value: true },
                then: { type: "Number", value: 1 },
                else: { type: "Number", value: 0 },
            });
        });
    });

    test("tail", () => {
        expect(parseA(expr, "f(0)(1)")).toEqual({
            type: "Call",
            callee: {
                type: "Call",
                callee: { type: "Ident", name: "f" },
                arguments: [{ type: "Number", value: 0 }],
            },
            arguments: [{ type: "Number", value: 1 }],
        });
    });

    test("Call", () => {
        expect(parseA(expr, `print("Hello world!")`)).toEqual({
            type: "Call",
            callee: { type: "Ident", name: "print" },
            arguments: [{ type: "String", value: "Hello world!" }],
        });
    });

    test("Property", () => {
        expect(parseA(expr, "().property")).toEqual({
            type: "Property",
            target: { type: "Tuple", elements: [] },
            name: "property",
        });
    });
});

test("script", () => {
    const source = `{
        fn main() {
            print("Hello world!");
            ()
        };
    }`;
    expect(parseA(expr, source)).toMatchSnapshot();
});
