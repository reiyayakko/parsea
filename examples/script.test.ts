import { describe, expect, test } from "@jest/globals";
import { expr, stat } from "./script";

describe("stat", () => {
    test("Let", () => {
        const result = stat.parse("let hoge = 0;");
        expect(result.success && result.value).toEqual({
            type: "Let",
            name: "hoge",
            init: { type: "Number", value: 0 },
        });
    });

    test("DefFn", () => {
        const result = stat.parse("fn main(arg) {};");
        expect(result.success && result.value).toEqual({
            type: "DefFn",
            name: "main",
            params: ["arg"],
            body: { type: "Block", stats: [], last: null },
        });
    });

    test("Return", () => {
        const result = stat.parse("return;");
        expect(result.success && result.value).toEqual({
            type: "Return",
            body: null,
        });
    });

    test("While", () => {
        const result = stat.parse("while (false) {};");
        expect(result.success && result.value).toEqual({
            type: "While",
            test: { type: "Bool", value: false },
            body: { type: "Block", stats: [], last: null },
        });
    });

    test("Break", () => {
        const result = stat.parse("break;");
        expect(result.success && result.value).toEqual({
            type: "Break",
        });
    });

    test("Expr", () => {
        const result = stat.parse("0;");
        expect(result.success && result.value).toEqual({
            type: "Expr",
            expr: { type: "Number", value: 0 },
        });
    });
});

describe("expr", () => {
    describe("Bool", () => {
        test.each([true, false])("%s", value => {
            const result = expr.parse(String(value));
            expect(result.success && result.value).toEqual({
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
            const result = expr.parse(src);
            expect(result.success && result.value).toEqual({
                type: "Number",
                value,
            });
        });
    });

    test("String", () => {
        const result = expr.parse(`"Hello world!"`);
        expect(result.success && result.value).toEqual({
            type: "String",
            value: "Hello world!",
        });
    });

    test("Ident", () => {
        const result = expr.parse("hoge");
        expect(result.success && result.value).toEqual({
            type: "Ident",
            name: "hoge",
        });
    });

    describe("Tuple", () => {
        test("empty", () => {
            const result = expr.parse("()");
            expect(result.success && result.value).toEqual({
                type: "Tuple",
                elements: [],
            });
        });
        test("elements", () => {
            const result = expr.parse(`(0, "", hoge)`);
            expect(result.success && result.value).toEqual({
                type: "Tuple",
                elements: [
                    { type: "Number", value: 0 },
                    { type: "String", value: "" },
                    { type: "Ident", name: "hoge" },
                ],
            });
        });
        test("trailing comma", () => {
            const result = expr.parse("(0, )");
            expect(result.success && result.value).toEqual({
                type: "Tuple",
                elements: [{ type: "Number", value: 0 }],
            });
        });
    });

    describe("Block", () => {
        test("empty", () => {
            const result = expr.parse("{}");
            expect(result.success && result.value).toEqual({
                type: "Block",
                stats: [],
                last: null,
            });
        });
        test("stats", () => {
            const result = expr.parse("{ 0; }");
            expect(result.success && result.value).toEqual({
                type: "Block",
                stats: [{ type: "Expr", expr: { type: "Number", value: 0 } }],
                last: null,
            });
        });
        test("expr", () => {
            const result = expr.parse("{ 0 }");
            expect(result.success && result.value).toEqual({
                type: "Block",
                stats: [],
                last: { type: "Number", value: 0 },
            });
        });
    });

    describe("If", () => {
        test("then only", () => {
            const result = expr.parse("if (true) {}");
            expect(result.success && result.value).toEqual({
                type: "If",
                test: { type: "Bool", value: true },
                then: { type: "Block", stats: [], last: null },
                else: null,
            });
        });
        test("with else", () => {
            const result = expr.parse("if (true) 1 else 0");
            expect(result.success && result.value).toEqual({
                type: "If",
                test: { type: "Bool", value: true },
                then: { type: "Number", value: 1 },
                else: { type: "Number", value: 0 },
            });
        });
    });

    test("tail", () => {
        const result = expr.parse(`f(0)(1)`);
        expect(result.success && result.value).toEqual({
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
        const result = expr.parse(`print("Hello world!")`);
        expect(result.success && result.value).toEqual({
            type: "Call",
            callee: { type: "Ident", name: "print" },
            arguments: [{ type: "String", value: "Hello world!" }],
        });
    });

    test("Property", () => {
        const result = expr.parse("().property");
        expect(result.success && result.value).toEqual({
            type: "Property",
            target: { type: "Tuple", elements: [] },
            name: "property",
        });
    });
});

test("script", () => {
    const result = expr.parse(`{
        fn main() {
            print("Hello world!");
            ()
        };
    }`);
    expect(result.success && result.value).toMatchSnapshot();
});
