import { describe, expect, test } from "@jest/globals";
import { expected } from "./error";
import {
    ANY_CHAR,
    CODE_POINT,
    graphemeString,
    regex,
    regexGroup,
    string,
} from "./string";

describe("string", () => {
    test("source type", () => {
        expect(string("").parse([])).toHaveProperty("success", false);
    });
    test("short source", () => {
        expect(string("a").parse("")).toEqual({
            success: false,
            index: 0,
            errors: [expected("a")],
        });
    });
    test("success", () => {
        expect(string("a").parse("a")).toMatchObject({ success: true, value: "a" });
    });
    test("fail", () => {
        expect(string("a").parse("b")).toEqual({
            success: false,
            index: 0,
            errors: [expected("a")],
        });
    });
});

describe("graphemeString", () => {
    test("source type", () => {
        expect(graphemeString("").parse([])).toHaveProperty("success", false);
    });
    test("short source", () => {
        expect(graphemeString("a").parse("")).toEqual({
            success: false,
            index: 0,
            errors: [expected("a")],
        });
    });
    test("success", () => {
        expect(graphemeString("a").parse("a")).toMatchObject({
            success: true,
            value: "a",
        });
    });
    test("fail", () => {
        expect(graphemeString("a").parse("b")).toEqual({
            success: false,
            index: 0,
            errors: [expected("a")],
        });
    });
    test("NFC <-> NFD", () => {
        expect(graphemeString("\xf1").parse("\xf1".normalize("NFD"))).toMatchObject({
            success: true,
            value: "\xf1".normalize("NFD"),
        });
    });
});

describe("CODE_POINT", () => {
    test("source type", () => {
        expect(CODE_POINT.parse([])).toHaveProperty("success", false);
    });
    test("short source", () => {
        expect(CODE_POINT.parse("")).toHaveProperty("success", false);
    });
    test("code unit", () => {
        expect(CODE_POINT.parse("a")).toMatchObject({ success: true, value: "a" });
    });
    test("surrogate pair", () => {
        const char = "🫠";
        expect(char).toHaveLength(2);
        expect(CODE_POINT.parse(char)).toMatchObject({ success: true, value: char });
    });
    test("high surrogate only", () => {
        expect(CODE_POINT.parse("\ud83e")).toHaveProperty("success", false);
    });
    test("high surrogate + non low surrogate", () => {
        expect(CODE_POINT.parse("\ud83e?")).toHaveProperty("success", false);
    });
    test("low surrogate only", () => {
        expect(CODE_POINT.parse("\udee0")).toHaveProperty("success", false);
    });
});

describe("ANY_CHAR", () => {
    test("source type", () => {
        expect(ANY_CHAR.parse([])).toHaveProperty("success", false);
    });
    test("short source", () => {
        expect(ANY_CHAR.parse("")).toHaveProperty("success", false);
    });
    test.each(["a", "👍", "👨‍👩‍👧‍👦"])('"%s"は1文字', char => {
        expect(ANY_CHAR.between(string("^"), string("$")).parse(`^${char}$`)).toEqual({
            success: true,
            index: char.length + 2,
            value: char,
        });
    });
});

describe("regexGroup", () => {
    test("source type", () => {
        expect(regexGroup(/(?:)/).parse([])).toHaveProperty("success", false);
    });
    test("ignore global flag", () => {
        const parser = regexGroup(/regexp?/g);
        const source = "regex!";
        expect(parser.parse(source)).toHaveProperty("success", true);
        expect(parser.parse(source)).toHaveProperty("success", true);
    });
    test("start index", () => {
        const parser = string("alpha").then(regexGroup(/alpha|beta/));
        expect(parser.parse("alpha beta")).toHaveProperty("success", false);
    });
    test("success with RegExpExecArray", () => {
        // cspell:ignore Floa
        const parser = regexGroup(/(Uin|In|Floa)t(8|16|32|64)(Clamped)?Array/);
        expect(parser.parse("Uint64ClampedArray!")).toEqual({
            success: true,
            index: "Uint64ClampedArray".length,
            value: expect.arrayContaining(["Uint64ClampedArray", "Uin", "64", "Clamped"]),
        });
    });
    test("fail", () => {
        expect(regexGroup(/.^/).parse("")).toHaveProperty("success", false);
    });
});

describe("regex", () => {
    test("groupIdを省略", () => {
        expect(regex(/(.)(.)/).parse("ab")).toMatchObject({
            success: true,
            value: "ab",
        });
    });
    test('typeof groupId == "number" なら`array[groupId]`', () => {
        expect(regex(/(.)(.)/, 2).parse("ab")).toMatchObject({
            success: true,
            value: "b",
        });
    });
    test('typeof groupId == "string" なら`array.groups[groupId]`', () => {
        expect(regex(/(?<a>.)(?<b>.)/, "b").parse("ab")).toMatchObject({
            success: true,
            value: "b",
        });
    });
    test("defaultValue", () => {
        expect(regex(/(?:)/, 1, "default").parse("")).toMatchObject({
            success: true,
            value: "default",
        });
    });
});
