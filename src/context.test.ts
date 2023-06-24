import { describe, expect, test } from "@jest/globals";
import { Context } from "./context";

describe("Context", () => {
    test("sourceにArrayLikeでない値を入れるとエラー", () => {
        expect(() => {
            new Context({ length: NaN }, {});
        }).toThrow(TypeError);
    });
});
