import { jsonParser } from "../examples/json";

describe("JSON", () => {
    test("ignore whitespace.", () => {
        expect(jsonParser).parseToSucc(" null ", 6, null);
        expect(jsonParser).parseToSucc(" [ ] ", 5, []);
        expect(jsonParser).parseToSucc(" [ null , 0 ] ", 14, [null, 0]);
        expect(jsonParser).parseToSucc(` { } `, 5, {});
        expect(jsonParser).parseToSucc(` { "1" : null , "2" : 0 } `, 26, { 1: null, 2: 0 });
    });
    test.each([
        "0",
        "3.141592",
        "4.2195e1",
        "0.00E+00",
        "0e-0",
    ])("parse numbers.", json => {
        expect(jsonParser).parseToSucc(json, json.length, JSON.parse(json));
        expect(jsonParser).parseToSucc("-" + json, json.length + 1, -JSON.parse(json));
    });
    test("number parsing to fail..", () => {
        expect(jsonParser).parseToFail("00", 1);
        expect(jsonParser).parseToFail("- 0", 0);
        expect(jsonParser).parseToFail("0.", 1);
        expect(jsonParser).parseToFail(".0", 0);
    });
    test.each([
        ["\""],
        ["\\"],
        ["/"],
        ["b", "\b"],
        ["f", "\f"],
        ["n", "\n"],
        ["r", "\r"],
        ["t", "\t"],
    ])("escape %s", (escapeChar, char = escapeChar) => {
        expect(jsonParser).parseToSucc(`"\\${escapeChar}"`, 4, char);
    });
    test("escape unicode", () => {
        expect(jsonParser).parseToSucc(`"\\u1234"`, 8, "\u1234");
    });
});
