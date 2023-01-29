import { pushError } from "./context";
import { Parser, Parsed } from "./parser";
import { ParseState, updateState } from "./state";

/**
 * Delays variable references until the parser runs.
 */
export const lazy = <T>(getParser: () => Parser<T>): Parser<T> => {
    let parser: Parser<T>;
    return new Parser((state, context) => {
        if (parser == null) {
            parser = getParser();
        }
        return parser.run(state, context);
    });
};

export const notFollowedBy = (parser: Parser<unknown>): Parser<unknown> =>
    new Parser((state, context) => {
        const newState = parser.run(state, context);
        if (newState == null) {
            return state;
        }
        pushError(context, state.pos);
        return null;
    });

export const lookAhead = <T>(parser: Parser<T>): Parser<T> =>
    new Parser((state, context) => {
        const newState = parser.run(state, context);
        return newState && updateState(state, newState.val, 0);
    });

type Seq<out T extends readonly Parser<unknown>[]> = {
    [K in keyof T]: Parsed<T[K]>;
};

export const seq: {
    <T extends readonly Parser<unknown>[] | []>(
        parsers: T,
        options?: { allowPartial?: false },
    ): Parser<Seq<T>>;
    <T extends readonly Parser<unknown>[] | []>(
        parsers: T,
        options: { allowPartial: boolean },
    ): Parser<Partial<Seq<T>>>;
} = (parsers, options) =>
    new Parser((state, context) => {
        const values: unknown[] = [];
        for (let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state, context);
            if (newState == null) {
                if (options?.allowPartial) break;
                return null;
            }
            values.push((state = newState).val);
        }
        return updateState(state, values, 0);
    });

type Choice<T extends readonly Parser<unknown>[]> = Parser<Parsed<T[number]>>;

export const choice = <T extends readonly Parser<unknown>[] | []>(
    parsers: T,
): Choice<T> =>
    new Parser((state, context) => {
        for (let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state, context);
            if (newState != null) {
                return newState as ParseState<Parsed<T[number]>>;
            }
        }
        return null;
    });
