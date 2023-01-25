import { pushError } from "./context";
import { Parser, Parsed } from "./parser";
import { updateState } from "./state";

/**
 * Delays variable references until the parser runs.
 */
export const lazy = <T>(getParser: () => Parser<T>): Parser<T> => {
    let cache: Parser<T>;
    return new Parser((state, context) => {
        if (cache == null) {
            cache = getParser();
        }
        return cache.run(state, context);
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

type Seq<T extends readonly Parser<unknown>[]> = [...{ [K in keyof T]: Parsed<T[K]> }];

export const seq: {
    <T extends readonly Parser<unknown>[]>(
        parsers: readonly [...T],
        options?: { droppable?: false },
    ): Parser<Seq<T>>;
    <T extends readonly Parser<unknown>[]>(
        parsers: readonly [...T],
        options?: { droppable?: boolean },
    ): Parser<Partial<Seq<T>>>;
} = (parsers, options) =>
    new Parser((state, context) => {
        const accum: unknown[] = [];
        for (let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state, context);
            if (newState == null) {
                if (options?.droppable) break;
                return null;
            }
            accum.push((state = newState).val);
        }
        return updateState(state, accum, 0);
    });

export const choice = <T>(parsers: readonly Parser<T>[]): Parser<T> =>
    new Parser((state, context) => {
        for (let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state, context);
            if (newState != null) {
                return newState;
            }
        }
        return null;
    });
