import { literal } from "../src/primitive";
import { regexGroup, regex } from "../src/string";

describe("string parsers", () => {
    describe("regexGroup", () => {
        test("sourceがstring型ではない場合失敗", () => {
            expect(regexGroup(/./)).parseToFail(["しかし、なにもおこらなかった！"], 0);
        });
        test("lastIndexがリセットされる", () => {
            const parser = regexGroup(/regexp?/g);
            const result = ["regex!", 5, expect.objectContaining(["regex"])] as const;
            expect(parser).parseToSucc(...result);
            expect(parser).parseToSucc(...result);
        });
        test("正規表現でパースしてRegExpExecArrayで成功", () => {
            const parser = regexGroup(/(Uin|In|Floa)t(8|16|32|64)(Clamped)?Array/);
            expect(parser).parseToSucc(
                "Uint64ClampedArray!",
                "Uint64ClampedArray".length,
                expect.objectContaining(["Uint64ClampedArray", "Uin", "64", "Clamped"]),
            );
            expect(parser).parseToFail("Uint128Array", 0);
            expect(regexGroup(/alpha|beta/)).parseToFail(" beta", 0);
            expect(literal("hello ").right(regexGroup(/\w+/))).parseToSucc(
                "hello world!",
                "hello world".length,
                expect.objectContaining(["world"]),
            );
        });
    });
    describe("regex", () => {
        test("省略した場合マッチした文字列全体で成功", () => {
            const parser = regex(/(.)(.)?/);
            expect(parser).parseToSucc("ab", 2, "ab");
            expect(parser).parseToSucc("a", 1, "a");
            expect(parser).parseToFail("\n", 0);
        });
        test("number型の場合`[groupId]`", () => {
            expect(regex(/(.)(.)/, 2)).parseToSucc("ab", 2, "b");
            expect(regex(/(.)(.)?/, 2)).parseToSucc("a", 1, void 0);
            expect(regex(/(.)(.)/, 8)).parseToSucc("ab", 2, void 0);
        });
        test("string型の場合`groups[groupId]`", () => {
            expect(regex(/(?<a>.)(?<b>.)/, "b")).parseToSucc("ab", 2, "b");
            expect(regex(/(?<a>.)(?<b>.)/, "unknown")).parseToSucc("ab", 2, void 0);
        });
    });
    describe.skip("anyChar", () => {
        let anyChar: import("../src/parser").Parser<string>;
        test("長さ不足で失敗する", () => {
            expect(anyChar).parseToFail("", 0);
        });
        test("sourceがstring型ではない場合失敗", () => {
            expect(anyChar).parseToFail(["しかし、なにもおこらなかった！"], 0);
        });
        test.each(["a", "あ", "👍", "👪", "👨‍👩‍👧‍👦"])('"%s"は1文字', char => {
            expect(anyChar).parseToSucc(char, char.length, char);
        });
    });
});
