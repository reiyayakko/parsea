import { jsonParser } from "./json";

describe("JSON", () => {
    const jsonNumbers = ["0", "3.141592", "4.2195e1", "0.00E+00", "0e-0"];
    test.each([
        // ignore whitespace
        " null ",
        " [ ] ",
        " [ null , 0 ] ",
        ` {  } `,
        ` { "1" : null , "2" : 0 } `,
        ...jsonNumbers,
        ...jsonNumbers.map(jsonNumber => "-" + jsonNumber),
    ])("%o", json => {
        expect(jsonParser.parse(json)).toEqual({
            pos: json.length,
            val: JSON.parse(json),
        });
    });
    test("number parsing to fail..", () => {
        expect(jsonParser.parse("00")).toBeNull();
        expect(jsonParser.parse("- 0")).toBeNull();
        expect(jsonParser.parse("0.")).toBeNull();
        expect(jsonParser.parse(".0")).toBeNull();
    });
    test.each([
        ['"'],
        ["\\"],
        ["/"],
        ["b", "\b"],
        ["f", "\f"],
        ["n", "\n"],
        ["r", "\r"],
        ["t", "\t"],
        ["u1234", "\u1234"],
    ])("escape %s", (escapeChar, char = escapeChar) => {
        const json = `"\\${escapeChar}"`;
        expect(jsonParser.parse(json)).toEqual({ pos: json.length, val: char });
    });
});
