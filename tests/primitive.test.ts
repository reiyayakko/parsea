import { anyEl, el, eoi, literal, pure, satisfy } from "../src/primitive";

describe("primitive parsers", () => {
    test("pure", () => {
        const sym = Symbol("ID");
        expect(pure(sym).parse([])).toEqual({ succ: true, target: [], pos: 0, value: sym });
    });
    test("eoi", () => {
        expect(eoi.parse([])).toEqual({ succ: true, target: [], pos: 0, value: null });
        expect(anyEl.left(eoi).parse(["el"])).toEqual(
            { succ: true, target: ["el"], pos: 1, value: "el" },
        );
        expect(eoi.parse(["el"])).toEqual({ succ: false, target: ["el"], pos: 0 });
    });
    describe("anyEl", () => {
        test("長さ不足で失敗する", () => {
            expect(anyEl.parse([])).toEqual({ succ: false, target: [], pos: 0 });
        });
        test("任意の要素で成功する", () => {
            expect(anyEl.parse([1, 2, 3])).toEqual(
                { succ: true, target: [1, 2, 3], pos: 1, value: 1 },
            );
            expect(anyEl.parse(["el"])).toEqual({ succ: true, target: ["el"], pos: 1, value: "el" });
        });
    });
    describe("el", () => {
        test("長さ不足で失敗する", () => {
            expect(el("").parse("")).toEqual({ succ: false, target: "", pos: 0 });
        });
        test("Object.isで判定", () => {
            expect(el(1).parse([1, 2, 3])).toEqual(
                { succ: true, target: [1, 2, 3], pos: 1, value: 1 },
            );
            expect(el(2).parse([1, 2, 3])).toEqual({ succ: false, target: [1, 2, 3], pos: 0 });
            expect(el(NaN).parse([NaN])).toEqual({ succ: true, target: [NaN], pos: 1, value: NaN });
            expect(el(-0).parse([0])).toEqual({ succ: false, target: [0], pos: 0 });
        });
    });
    describe("satisfy", () => {
        test("長さ不足で失敗する", () => {
            const mock = jest.fn<boolean, []>().mockReturnValue(true);
            expect(satisfy(mock).parse([])).toEqual({ succ: false, target: [], pos: 0 });
            expect(mock).toHaveBeenCalledTimes(0);
        });
        test("条件に合う要素で成功", () => {
            const evenParser = satisfy(el => (el as number) % 2 === 0);
            expect(evenParser.parse([8])).toEqual(
                { succ: true, target: [8], pos: 1, value: 8 },
            );
            expect(evenParser.parse([7])).toEqual({ succ: false, target: [7], pos: 0 });
        });
    });
    describe("literal", () => {
        test("長さ不足で失敗する", () => {
            expect(literal([2, 3, 5, 7, 11]).parse([2, 3, 5])).toEqual(
                { succ: false, target: [2, 3, 5], pos: 0 },
            );
        });
        test("空", () => {
            expect(literal([]).parse([])).toEqual({ succ: true, target: [], pos: 0, value: [] });
        });
        test("Object.isで判定", () => {
            // succ
            const str = "3分間待ってやる";
            expect(literal(str).parse([...str + "..."])).toEqual(
                { succ: true, target: [...str + "..."], pos: str.length, value: str },
            );
            expect(literal(["バ", "ル", "ス"]).parse("バルス")).toEqual(
                { succ: true, target: "バルス", pos: 3, value: ["バ", "ル", "ス"] },
            );
            const emoji = "👨‍👩‍👧‍👦";
            expect(literal(emoji).parse(emoji + "!")).toEqual(
                { succ: true, target: emoji + "!", pos: emoji.length, value: emoji },
            );

            // fail
            expect(literal("ふんいき").parse("ふいんき")).toEqual(
                { succ: false, target: "ふいんき", pos: 1 },
            );
            expect(literal(["hoge", NaN, -0]).parse(["hoge", NaN, 0])).toEqual(
                { succ: false, target: ["hoge", NaN, 0], pos: 2 },
            );
        });
    });
});
