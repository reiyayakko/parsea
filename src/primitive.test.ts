import { describe, test, expect, jest } from "@jest/globals";
import { ANY_EL, EOI, el, literal, pure, satisfy } from "./primitive";

test("pure", () => {
    const symbol = Symbol("ID");
    expect(pure(symbol).parse([])?.v).toBe(symbol);
});

describe("EOI", () => {
    test("end of input", () => {
        expect(ANY_EL.and(EOI).parse(["el"])).not.toBeNull();
    });
    test("消費しきっていない要素がある場合失敗", () => {
        expect(EOI.parse(["el"])).toBeNull();
    });
});

describe("ANY_EL", () => {
    test("lengthが1以上必要", () => {
        expect(ANY_EL.parse([])).toBeNull();
    });
    test("長さを1消費", () => {
        expect(ANY_EL.parse([0])?.i).toBe(1);
    });
    test("任意の要素で成功する", () => {
        expect(ANY_EL.parse(["el"])?.v).toBe("el");
    });
});

describe("el", () => {
    test("SameValueZeroで判定", () => {
        expect(el(1).parse([1])?.v).toBe(1);
        expect(el(2).parse([1])).toBeNull();
        expect(el(NaN).parse([NaN])?.v).toBe(NaN);
        expect(el(-0).parse([0])?.v).toBe(0);
    });
});

describe("satisfy", () => {
    test("残りの長さが1以上必要", () => {
        const mock = jest.fn<() => boolean>().mockReturnValue(true);
        expect(satisfy(mock).parse([])).toBeNull();
        expect(mock).toHaveBeenCalledTimes(0);
    });
    test("条件に合う要素で成功", () => {
        const EvenNumberParser = satisfy(el => (el as number) % 2 === 0);
        expect(EvenNumberParser.parse([8])).not.toBeNull();
        expect(EvenNumberParser.parse([7])).toBeNull();
    });
    test("valueは要素", () => {
        expect(satisfy(() => true).parse([6])?.v).toBe(6);
    });
});

describe("literal", () => {
    test("sourceが短いと失敗", () => {
        expect(literal([2, 3, 5, 7, 11]).parse([2, 3, 5])).toBeNull();
    });
    test("空", () => {
        expect(literal([]).parse([])?.v).toStrictEqual([]);
    });
    test("違う要素で失敗", () => {
        expect(literal("ふんいき").parse("ふいんき")).toBeNull();
    });
    test("SameValueZeroで判定", () => {
        const parser = literal(["hoge", NaN, -0]);
        expect(parser.parse(["hoge", NaN, 0])?.v).toStrictEqual(["hoge", NaN, -0]);
    });
});
