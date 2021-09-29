import { Parser } from "./parser";
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

export const seq = <T>(
    parsers: Parser<T>[],
    options?: { droppable?: boolean },
): Parser<T[]> =>
    new Parser(state => {
        const accum: T[] = [];
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

export const choice = <T>(parsers: Parser<T>[]): Parser<T> =>
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
