import { describe, test, expect } from "@jest/globals";
import { literal } from "./primitive";
import { regexGroup, regex } from "./string";

describe("string parsers", () => {
    describe("regexGroup", () => {
        test("sourceがstring型ではない場合失敗", () => {
            expect(regexGroup(/./).parse(["しかし、なにもおこらなかった！"])).toBeNull();
        });
        test("lastIndexがリセットされる", () => {
            const parser = regexGroup(/regexp?/g);
            const str = "regex!";
            const result = { pos: 5, val: expect.objectContaining(["regex"]) };
            expect(parser.parse(str)).toEqual(result);
            expect(parser.parse(str)).toEqual(result);
        });
        test("正規表現でパースしてRegExpExecArrayで成功", () => {
            const parser = regexGroup(/(Uin|In|Floa)t(8|16|32|64)(Clamped)?Array/);
            expect(parser.parse("Uint64ClampedArray!")).toEqual({
                pos: "Uint64ClampedArray".length,
                val: expect.objectContaining([
                    "Uint64ClampedArray",
                    "Uin",
                    "64",
                    "Clamped",
                ]),
            });
            expect(parser.parse("Uint128Array")).toBeNull();
            expect(regexGroup(/alpha|beta/).parse(" beta")).toBeNull();
            expect(
                literal("hello ").and(regexGroup(/\w+/)).parse("hello world!"),
            ).toEqual({
                pos: "hello world".length,
                val: expect.objectContaining(["world"]),
            });
        });
    });
    describe("regex", () => {
        test("省略した場合マッチした文字列全体で成功", () => {
            const parser = regex(/(.)(.)?/);
            expect(parser.parse("ab")).toEqual({ pos: 2, val: "ab" });
            expect(parser.parse("a")).toEqual({ pos: 1, val: "a" });
            expect(parser.parse("\n")).toBeNull();
        });
        test("number型の場合`[groupId]`", () => {
            expect(regex(/(.)(.)/, 2).parse("ab")).toEqual({ pos: 2, val: "b" });
            expect(regex(/(.)(.)?/, 2).parse("a")).toEqual({ pos: 1, val: void 0 });
            expect(regex(/(.)(.)/, 8).parse("ab")).toEqual({ pos: 2, val: void 0 });
        });
        test("string型の場合`groups[groupId]`", () => {
            expect(regex(/(?<a>.)(?<b>.)/, "b").parse("ab")).toEqual({
                pos: 2,
                val: "b",
            });
            expect(regex(/(?<a>.)(?<b>.)/, "unknown").parse("ab")).toEqual({
                pos: 2,
                val: void 0,
            });
        });
    });
    describe.skip("anyChar", () => {
        let anyChar: import("../src/parser").Parser<string>;
        test("長さ不足で失敗する", () => {
            expect(anyChar.parse("")).toBeNull();
        });
        test("sourceがstring型ではない場合失敗", () => {
            expect(anyChar.parse(["しかし、なにもおこらなかった！"])).toBeNull();
        });
        test.each(["a", "あ", "👍", "👪", "👨‍👩‍👧‍👦"])('"%s"は1文字', char => {
            expect(anyChar.parse(char)).toEqual({ pos: char.length, val: char });
        });
    });
});
