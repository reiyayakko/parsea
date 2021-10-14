import { Parser, Parsed } from "./parser";
import { failFrom, margeFail, succUpdate } from "./state";

/**
 * Delays variable references until the parser runs.
 */
export const lazy = <T>(getParser: () => Parser<T>): Parser<T> => {
    let cache: Parser<T>;
    return new Parser(state => {
        if (cache == null) {
            cache = getParser();
        }
        return cache.run(state);
    });
};

export const notFollowedBy = (parser: Parser<unknown>): Parser<unknown> =>
    new Parser(state => {
        const newState = parser.run(state);
        if (newState.succ) {
            return failFrom(newState.src, newState.pos);
        }
        return state;
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
    new Parser(state => {
        const accum: unknown[] = [];
        for (let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state);
            if (!newState.succ) {
                if (options?.droppable) break;
                return newState;
            }
            accum.push(newState.val);
            state = newState;
        }
        return succUpdate(state, accum, 0);
    });

export const choice = <T>(parsers: readonly Parser<T>[]): Parser<T> =>
    new Parser(state => {
        let fail = failFrom(state.src, state.pos);
        for (let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state);
            if (newState.succ) {
                return newState;
            }
            fail = margeFail(fail, newState);
        }
        return fail;
    });
