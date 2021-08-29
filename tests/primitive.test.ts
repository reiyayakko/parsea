import { pure } from "../src/primitive";

describe("primitive parsers", () => {
    test("pure", () => {
        const sym = Symbol("ID");
        expect(pure(sym).parse([])).toEqual({ succ: true, target: [], pos: 0, value: sym });
    });
});
