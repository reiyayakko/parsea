import { ANY_EL, EOI, el, literal, pure, satisfy } from "../src/primitive";

describe("primitive parsers", () => {
    test("pure", () => {
        const sym = Symbol("ID");
        expect(pure(sym).parse([])).toEqual({ pos: 0, val: sym });
    });
    test("EOI", () => {
        expect(EOI.parse([])).toEqual({ pos: 0, val: null });
        expect(ANY_EL.and(EOI, true).parse(["el"])).toEqual({ pos: 1, val: "el" });
        expect(EOI.parse(["el"])).toBeNull();
    });
    describe("ANY_EL", () => {
        test("長さ不足で失敗する", () => {
            expect(ANY_EL.parse([])).toBeNull();
        });
        test("任意の要素で成功する", () => {
            expect(ANY_EL.parse([1, 2, 3])).toEqual({ pos: 1, val: 1 });
            expect(ANY_EL.parse(["el"])).toEqual({ pos: 1, val: "el" });
        });
    });
    describe("el", () => {
        test("長さ不足で失敗する", () => {
            expect(el("").parse("")).toBeNull();
        });
        test("SameValueZeroで判定", () => {
            expect(el(1).parse([1, 2, 3])).toEqual({ pos: 1, val: 1 });
            expect(el(2).parse([1, 2, 3])).toBeNull();
            expect(el(NaN).parse([NaN])).toEqual({ pos: 1, val: NaN });
            expect(el(-0).parse([0])).toEqual({ pos: 1, val: 0 });
        });
    });
    describe("satisfy", () => {
        test("長さ不足で失敗する", () => {
            const mock = jest.fn<boolean, []>().mockReturnValue(true);
            expect(satisfy(mock).parse([])).toBeNull();
            expect(mock).toHaveBeenCalledTimes(0);
        });
        test("条件に合う要素で成功", () => {
            const evenParser = satisfy(el => (el as number) % 2 === 0);
            expect(evenParser.parse([8])).toEqual({ pos: 1, val: 8 });
            expect(evenParser.parse([7])).toBeNull();
        });
    });
    describe("literal", () => {
        test("長さ不足で失敗する", () => {
            expect(literal([2, 3, 5, 7, 11]).parse([2, 3, 5])).toBeNull();
        });
        test("空", () => {
            expect(literal([]).parse([])).toEqual({ pos: 0, val: [] });
        });
        test("SameValueZeroで判定", () => {
            const str = "3分間待ってやる";
            expect(literal(str).parse([...(str + "...")])).toEqual({
                pos: str.length,
                val: str,
            });
            expect(literal(["バ", "ル", "ス"]).parse("バルス")).toEqual({
                pos: 3,
                val: ["バ", "ル", "ス"],
            });
            const emoji = "👨‍👩‍👧‍👦";
            expect(literal(emoji).parse(emoji + "!")).toEqual({
                pos: emoji.length,
                val: emoji,
            });
            expect(literal(["hoge", NaN, -0]).parse(["hoge", NaN, 0])).toEqual({
                pos: 3,
                val: ["hoge", NaN, -0],
            });
            expect(literal("ふんいき").parse("ふいんき")).toBeNull();
        });
    });
});
