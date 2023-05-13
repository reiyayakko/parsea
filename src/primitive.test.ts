import { describe, expect, jest, test } from "@jest/globals";
import { ANY_EL, EOI, el, literal, pure, satisfy } from "./primitive";

test("pure", () => {
    const symbol = Symbol("ID");
    expect(pure(symbol).parse([])).toHaveProperty("value", symbol);
});

describe("EOI", () => {
    test("end of input", () => {
        expect(ANY_EL.then(EOI).parse(["el"])).toHaveProperty("success", true);
    });
    test("消費しきっていない要素がある場合失敗", () => {
        expect(EOI.parse(["el"])).toHaveProperty("success", false);
    });
});

describe("ANY_EL", () => {
    test("lengthが1以上必要", () => {
        expect(ANY_EL.parse([])).toHaveProperty("success", false);
    });
    test("長さを1消費", () => {
        expect(ANY_EL.parse([0])).toHaveProperty("index", 1);
    });
    test("任意の要素で成功する", () => {
        expect(ANY_EL.parse(["el"])).toHaveProperty("value", "el");
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
        expect(literal([2, 3, 5, 7, 11]).parse([2, 3, 5])).toHaveProperty(
            "success",
            false,
        );
    });
    test("空", () => {
        expect(literal([]).parse([])).toHaveProperty("value", []);
    });
    test("違う要素で失敗", () => {
        expect(literal("ふんいき").parse("ふいんき")).toHaveProperty("success", false);
    });
    test("SameValueZeroで判定", () => {
        const parser = literal(["hoge", NaN, -0]);
        expect(parser.parse(["hoge", NaN, 0])).toHaveProperty("value", ["hoge", NaN, -0]);
    });
});
