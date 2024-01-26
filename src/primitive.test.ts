import { describe, expect, jest, test } from "@jest/globals";
import { expected } from "./error";
import { anyEl, el, eoi, literal, pure, satisfy } from "./primitive";

test("pure", () => {
    const symbol = Symbol("ID");
    expect(pure(symbol).parse([])).toHaveProperty("value", symbol);
});

describe("end of input", () => {
    test("end of input", () => {
        expect(anyEl.then(eoi).parse(["el"])).toHaveProperty("success", true);
    });
    test("消費しきっていない要素がある場合失敗", () => {
        expect(eoi.parse(["el"])).toHaveProperty("success", false);
    });
});

describe("anyEl", () => {
    test("lengthが1以上必要", () => {
        expect(anyEl.parse([])).toHaveProperty("success", false);
    });
    test("長さを1消費", () => {
        expect(anyEl.parse([0])).toHaveProperty("index", 1);
    });
    test("任意の要素で成功する", () => {
        expect(anyEl.parse(["el"])).toHaveProperty("value", "el");
    });
});

describe("el", () => {
    test("SameValueZeroで判定", () => {
        expect(el(1).parse([1])).toHaveProperty("value", 1);
        expect(el(2).parse([1])).toHaveProperty("success", false);
        expect(el(NaN).parse([NaN])).toHaveProperty("value", NaN);
        expect(el(-0).parse([0])).toHaveProperty("value", 0);
    });
});

describe("satisfy", () => {
    test("残りの長さが1以上必要", () => {
        const mock = jest.fn<() => boolean>().mockReturnValue(true);
        expect(satisfy(mock).parse([])).toHaveProperty("success", false);
        expect(mock).toHaveBeenCalledTimes(0);
    });
    test("条件に合う要素で成功", () => {
        const EvenNumberParser = satisfy(el => (el as number) % 2 === 0);
        expect(EvenNumberParser.parse([8])).toHaveProperty("success", true);
        expect(EvenNumberParser.parse([7])).toHaveProperty("success", false);
    });
    test("valueは要素", () => {
        expect(satisfy(() => true).parse([6])).toHaveProperty("value", 6);
    });
});

describe("literal", () => {
    test("sourceが短いと失敗", () => {
        expect(literal("abc").parse("ab")).toEqual({
            success: false,
            index: 0,
            errors: [expected("abc")],
        });
    });
    test("空", () => {
        expect(literal([]).parse([])).toHaveProperty("value", []);
    });
    test("違う要素で失敗", () => {
        expect(literal("ふんいき").parse("ふいんき")).toEqual({
            success: false,
            index: 0,
            errors: [expected("ふんいき")],
        });
    });
    test("SameValueZeroで判定", () => {
        const parser = literal(["hoge", NaN, -0]);
        expect(parser.parse(["hoge", NaN, 0])).toHaveProperty("value", ["hoge", NaN, -0]);
    });
});
