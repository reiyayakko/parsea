import { isInt32 } from "emnorst";
import { satisfy } from "../src/primitive";
import { qo } from "../src/do";

test("do", () => {
    const parser = qo(perform => {
        const a = perform(satisfy<number>(isInt32));
        const b = perform(satisfy<string>(el => typeof el === "string"));
        return { a, b };
    });
    expect(parser.parse([5, "*"])).toEqual({ pos: 2, val: { a: 5, b: "*" } });
    expect(parser.parse([20, 5])).toBeNull();
});
