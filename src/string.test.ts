import { describe, test, expect } from "@jest/globals";
import { literal } from "./primitive";
import { regexGroup, regex } from "./string";

describe("regexGroup", () => {
    test("sourceがstring型ではない場合失敗", () => {
        expect(regexGroup(/./).parse(["しかし、なにもおこらなかった！"])).toBeNull();
    });
    test("gフラグを無視", () => {
        const parser = regexGroup(/regexp?/g);
        const source = "regex!";
        expect(parser.parse(source)).not.toBeNull();
        expect(parser.parse(source)).not.toBeNull();
    });
    test("先頭以外にマッチしない", () => {
        expect(regexGroup(/alpha|beta/).parse(" beta")).toBeNull();
    });
    test("途中からパース", () => {
        expect(literal("hello ").and(regexGroup(/\w+/)).parse("hello world!")).toEqual({
            i: "hello world".length,
            v: expect.arrayContaining(["world"]),
        });
    });
    test("正規表現でパースしてRegExpExecArrayで成功", () => {
        const parser = regexGroup(/(Uin|In|Floa)t(8|16|32|64)(Clamped)?Array/);
        expect(parser.parse("Uint64ClampedArray!")).toEqual({
            i: "Uint64ClampedArray".length,
            v: expect.arrayContaining(["Uint64ClampedArray", "Uin", "64", "Clamped"]),
        });
        expect(parser.parse("Uint128Array")).toBeNull();
    });
});

describe("regex", () => {
    test("groupIdを省略した場合マッチした文字列全体で成功", () => {
        const parser = regex(/(.)(.)?/);
        expect(parser.parse("ab")?.v).toBe("ab");
        expect(parser.parse("a")?.v).toBe("a");
        expect(parser.parse("\n")).toBeNull();
    });
    test("typeof groupId === number なら`array[groupId]`", () => {
        expect(regex(/(.)(.)/, 2).parse("ab")?.v).toBe("b");
        expect(regex(/(.)(.)?/, 2).parse("a")?.v).toBeUndefined();
        expect(regex(/(.)(.)/, 8).parse("ab")?.v).toBeUndefined();
    });
    test("typeof groupId === string なら`array.groups[groupId]`", () => {
        expect(regex(/(?<a>.)(?<b>.)/, "b").parse("ab")?.v).toBe("b");
        expect(regex(/(?<a>.)(?<b>.)/, "unknown").parse("ab")?.v).toBeUndefined();
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
        expect(anyChar.parse(char)).toEqual({ i: char.length, v: char });
    });
});
