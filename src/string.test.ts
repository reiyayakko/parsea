import { describe, expect, test } from "@jest/globals";
import { expected } from "./error";
import { literal } from "./primitive";
import { regex, regexGroup, string } from "./string";

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
    test("ok", () => {
        expect(string("a").parse("a")).toHaveProperty("value", "a");
    });
    test("fail", () => {
        expect(string("a").parse("b")).toEqual({
            success: false,
            index: 0,
            errors: [expected("a")],
        });
    });
});

describe("regexGroup", () => {
    test("sourceがstring型ではない場合失敗", () => {
        const nonStringSource = ["しかし、なにもおこらなかった！"];
        expect(regexGroup(/./).parse(nonStringSource)).toHaveProperty("success", false);
    });
    test("gフラグを無視", () => {
        const parser = regexGroup(/regexp?/g);
        const source = "regex!";
        expect(parser.parse(source)).toHaveProperty("success", true);
        expect(parser.parse(source)).toHaveProperty("success", true);
    });
    test("先頭以外にマッチしない", () => {
        expect(regexGroup(/alpha|beta/).parse(" beta")).toHaveProperty("success", false);
    });
    test("途中からパース", () => {
        expect(literal("hello ").then(regexGroup(/\w+/)).parse("hello world!")).toEqual({
            success: true,
            index: "hello world".length,
            value: expect.arrayContaining(["world"]),
        });
    });
    test("正規表現でパースしてRegExpExecArrayで成功", () => {
        const parser = regexGroup(/(Uin|In|Floa)t(8|16|32|64)(Clamped)?Array/);
        expect(parser.parse("Uint64ClampedArray!")).toEqual({
            success: true,
            index: "Uint64ClampedArray".length,
            value: expect.arrayContaining(["Uint64ClampedArray", "Uin", "64", "Clamped"]),
        });
        expect(parser.parse("Uint128Array")).toHaveProperty("success", false);
    });
});

describe("regex", () => {
    test("groupIdを省略した場合マッチした文字列全体で成功", () => {
        const parser = regex(/(.)(.)?/);
        expect(parser.parse("ab")).toHaveProperty("value", "ab");
        expect(parser.parse("a")).toHaveProperty("value", "a");
        expect(parser.parse("\n")).toHaveProperty("success", false);
    });
    test("typeof groupId === number なら`array[groupId]`", () => {
        expect(regex(/(.)(.)/, 2).parse("ab")).toHaveProperty("value", "b");
        expect(regex(/(.)(.)?/, 2).parse("a")).toHaveProperty("value", undefined);
        expect(regex(/(.)(.)/, 8).parse("ab")).toHaveProperty("value", undefined);
    });
    test("typeof groupId === string なら`array.groups[groupId]`", () => {
        expect(regex(/(?<a>.)(?<b>.)/, "b").parse("ab")).toHaveProperty("value", "b");
        expect(regex(/(?<a>.)(?<b>.)/, "unknown group id").parse("ab")).toHaveProperty(
            "value",
            undefined,
        );
    });
    test("defaultValue", () => {
        expect(regex(/(?:)/, 1, "default").parse("")).toHaveProperty("value", "default");
    });
});

describe.skip("anyChar", () => {
    let anyChar: import("../src/parser").Parser<string>;
    test("長さ不足で失敗する", () => {
        expect(anyChar.parse("")).toHaveProperty("success", false);
    });
    test("sourceがstring型ではない場合失敗", () => {
        const nonStringSource = ["しかし、なにもおこらなかった！"];
        expect(anyChar.parse(nonStringSource)).toHaveProperty("success", false);
    });
    test.each(["a", "あ", "👍", "👪", "👨‍👩‍👧‍👦"])('"%s"は1文字', char => {
        expect(anyChar.parse(char)).toEqual({
            success: true,
            index: char.length,
            value: char,
        });
    });
});
