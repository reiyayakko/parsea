import type { Context } from "./context";
import type { ParseState } from "./state";

type SuccessParseResult<out T> = {
    success: true;
    index: number;
    value: T;
};

type FailureParseResult = {
    success: false;
};

export type ParseResult<T> = SuccessParseResult<T> | FailureParseResult;

export const createParseResult = <T>(
    finalState: ParseState<T> | null,
    context: Context,
): ParseResult<T> => {
    if (finalState == null) {
        return {
            success: false,
        };
    } else {
        return {
            success: true,
            index: finalState.i,
            value: finalState.v,
        };
    }
};
