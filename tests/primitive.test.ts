import { ANY_EL, EOI, el, literal, pure, satisfy } from "../src/primitive";

describe("primitive parsers", () => {
    test("pure", () => {
        const sym = Symbol("ID");
        expect(pure(sym)).parseToSucc([], 0, sym);
    });
    test("EOI", () => {
        expect(EOI).parseToSucc([], 0, null);
        expect(ANY_EL.left(EOI)).parseToSucc(["el"], 1, "el");
        expect(EOI).parseToFail(["el"], 0);
    });
    describe("ANY_EL", () => {
        test("長さ不足で失敗する", () => {
            expect(ANY_EL).parseToFail([], 0);
        });
        test("任意の要素で成功する", () => {
            expect(ANY_EL).parseToSucc([1, 2, 3], 1, 1);
            expect(ANY_EL).parseToSucc(["el"], 1, "el");
        });
    });
    describe("el", () => {
        test("長さ不足で失敗する", () => {
            expect(el("")).parseToFail("", 0);
        });
        test("Object.isで判定", () => {
            expect(el(1)).parseToSucc([1, 2, 3], 1, 1);
            expect(el(2)).parseToFail([1, 2, 3], 0);
            expect(el(NaN)).parseToSucc([NaN], 1, NaN);
            expect(el(-0)).parseToFail([0], 0);
        });
    });
    describe("satisfy", () => {
        test("長さ不足で失敗する", () => {
            const mock = jest.fn<boolean, []>().mockReturnValue(true);
            expect(satisfy(mock)).parseToFail([], 0);
            expect(mock).toHaveBeenCalledTimes(0);
        });
        test("条件に合う要素で成功", () => {
            const evenParser = satisfy(el => (el as number) % 2 === 0);
            expect(evenParser).parseToSucc([8], 1, 8);
            expect(evenParser).parseToFail([7], 0);
        });
    });
    describe("literal", () => {
        test("長さ不足で失敗する", () => {
            expect(literal([2, 3, 5, 7, 11])).parseToFail([2, 3, 5], 0);
        });
        test("空", () => {
            expect(literal([])).parseToSucc([], 0, []);
        });
        test("Object.isで判定", () => {
            // succ
            const str = "3分間待ってやる";
            expect(literal(str)).parseToSucc([...str + "..."], str.length, str);
            expect(literal(["バ", "ル", "ス"])).parseToSucc("バルス", 3, ["バ", "ル", "ス"]);
            const emoji = "👨‍👩‍👧‍👦";
            expect(literal(emoji)).parseToSucc(emoji + "!", emoji.length, emoji);

            // fail
            expect(literal("ふんいき")).parseToFail("ふいんき", 1);
            expect(literal(["hoge", NaN, -0])).parseToFail(["hoge", NaN, 0], 2);
        });
    });
});
