import { describe, expect, test } from "@jest/globals";
import { ParseAError, parseA } from "./parsea";
import { anyChar, codePoint, graphemeString, regex, regexGroup, string } from "./string";

describe("string", () => {
    test("source type", () => {
        expect(() => parseA(string(""), [])).toThrow(ParseAError);
    });
    test("short source", () => {
        expect(() => parseA(string("a"), "")).toThrow(ParseAError);
    });
    test("success", () => {
        expect(parseA(string("a"), "a")).toBe("a");
    });
    test("fail", () => {
        expect(() => parseA(string("a"), "b")).toThrow(ParseAError);
    });
});

describe("graphemeString", () => {
    test("source type", () => {
        expect(() => parseA(graphemeString(""), [])).toThrow(ParseAError);
    });
    test("short source", () => {
        expect(() => parseA(graphemeString("a"), "")).toThrow(ParseAError);
    });
    test("success", () => {
        expect(parseA(graphemeString("a"), "a")).toBe("a");
    });
    test("fail", () => {
        expect(() => parseA(graphemeString("a"), "b")).toThrow(ParseAError);
    });
    test("NFC <-> NFD", () => {
        expect(parseA(graphemeString("\xf1"), "\xf1".normalize("NFD"))).toBe(
            "\xf1".normalize("NFD"),
        );
    });
});

describe("codePoint", () => {
    test("source type", () => {
        expect(() => parseA(codePoint, [])).toThrow(ParseAError);
    });
    test("short source", () => {
        expect(() => parseA(codePoint, "")).toThrow(ParseAError);
    });
    test("code unit", () => {
        expect(parseA(codePoint, "a")).toBe("a");
    });
    test("surrogate pair", () => {
        const char = "🫠";
        expect(char).toHaveLength(2);
        expect(parseA(codePoint, char)).toBe(char);
    });
    test("high surrogate only", () => {
        expect(() => parseA(codePoint, "\ud83e")).toThrow(ParseAError);
    });
    test("high surrogate + non low surrogate", () => {
        expect(() => parseA(codePoint, "\ud83e?")).toThrow(ParseAError);
    });
    test("low surrogate only", () => {
        expect(() => parseA(codePoint, "\udee0")).toThrow(ParseAError);
    });
});

describe("anyChar", () => {
    test("source type", () => {
        expect(() => parseA(anyChar, [])).toThrow(ParseAError);
    });
    test("short source", () => {
        expect(() => parseA(anyChar, "")).toThrow(ParseAError);
    });
    test.each(["a", "👍", "👨‍👩‍👧‍👦"])('"%s"は1文字', char => {
        const parser = anyChar.between(string("^"), string("$"));
        expect(parseA(parser, `^${char}$`)).toBe(char);
    });
});

describe("regexGroup", () => {
    test("source type", () => {
        expect(() => parseA(regexGroup(/(?:)/), [])).toThrow(ParseAError);
    });
    test("ignore global flag", () => {
        const parser = regexGroup(/regexp?/g).skip(string("!"));
        const source = "regex!";
        expect(parseA(parser, source)).toContain("regex");
        expect(parseA(parser, source)).toContain("regex");
    });
    test("start index", () => {
        const parser = string("alpha").then(regexGroup(/alpha|beta/));
        expect(() => parseA(parser, "alpha beta")).toThrow(ParseAError);
    });
    test("success with RegExpExecArray", () => {
        // cspell:ignore Floa
        const parser = regexGroup(/(Uin|In|Floa)t\d+(Clamped)?Array/).skip(string("!"));
        expect(parseA(parser, "Uint64ClampedArray!")).toEqual(
            Object.assign(["Uint64ClampedArray", "Uin", "Clamped"], {
                index: 0,
                input: "Uint64ClampedArray!",
            }),
        );
    });
    test("fail", () => {
        expect(() => parseA(regexGroup(/.^/), "")).toThrow(ParseAError);
    });
});

describe("regex", () => {
    test("groupId?", () => {
        expect(parseA(regex(/ミ(O_O )/), "ミO_O ")).toBe("ミO_O ");
    });
    test("groupId: number", () => {
        expect(parseA(regex(/_(:3ゝ∠)_/, 1), "_:3ゝ∠_")).toBe(":3ゝ∠");
    });
    test("groupId: string", () => {
        expect(parseA(regex(/(?<hoge>.)/, "hoge"), "a")).toBe("a");
    });
    test("defaultValue", () => {
        expect(parseA(regex(/(?:)/, 1, "default"), "")).toBe("default");
        expect(parseA(regex(/(?:)/, "hoge", "default"), "")).toBe("default");
    });
});
