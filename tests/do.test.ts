import { isInt32 } from "emnorst";
import { satisfy } from "../src/primitive";
import { qo } from "../src/do";

test("do", () => {
    const parser = qo(perform => {
        const a = perform(satisfy<number>(isInt32));
        const b = perform(satisfy<string>(el => typeof el === "string"));
        return { a, b };
    });
    expect(parser).parseToSucc([5, "*"], 3, { a: 5, b: "*" });
    expect(parser).parseToFail([20, 5], 1);
});
