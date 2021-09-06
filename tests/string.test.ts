import { literal } from "../src/primitive";
import { regexGroup } from "../src/string";

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
            expect(literal("hello ").right(regexGroup(/\w+/))).parseToSucc(
                "hello world!",
                "hello world".length,
                expect.objectContaining(["world"]),
            );
        });
    });
});
