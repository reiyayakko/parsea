import { literal } from "../src/primitive";
import { regexGroup } from "../src/string";

describe("string parsers", () => {
    describe("regexGroup", () => {
        const object = expect.objectContaining;

        test("targetがstring型ではない場合失敗", () => {
            expect(regexGroup(/./)).parseResultToEqual(
                { succ: false, target: ["しかし、なにもおこらなかった！"], pos: 0 },
            );
        });
        test("lastIndexのリセット", () => {
            const parser = regexGroup(/regexp?/g);
            const result = { succ: true, target: "regex!", pos: 5, value: object(["regex"]) };
            expect(parser).parseResultToEqual(result);
            expect(parser).parseResultToEqual(result);
        });
        test("正規表現でパースしてRegExpExecArrayで成功", () => {
            const parser = regexGroup(/(Uin|In|Floa)t(8|16|32|64)(Clamped)?Array/);
            expect(parser).parseResultToEqual({
                succ: true,
                target: "Uint64ClampedArray!",
                pos: "Uint64ClampedArray".length,
                value: object(["Uint64ClampedArray", "Uin", "64", "Clamped"]),
            });
            expect(parser).parseResultToEqual({ succ: false, target: "Uint128Array", pos: 0 });
            expect(literal("hello ").right(regexGroup(/\w+/))).parseResultToEqual({
                succ: true,
                target: "hello world!",
                pos: "hello world".length,
                value: object(["world"]),
            });
        });
    });
});
