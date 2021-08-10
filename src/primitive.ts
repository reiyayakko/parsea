import { Parser } from "./parser";
import { failFromSucc, succUpdate } from "./state";

/**
 * Delays variable references until the parser runs.
 */
export const lazy = <T>(getParser: () => Parser<T>): Parser<T> => {
    let cache: Parser<T>;
    return new Parser(state => {
        if(cache == null) {
            cache = getParser();
        }
        return cache.run(state);
    });
};

/**
 * Always succeed with the value of the argument.
 */
export const pure = <T>(value: T): Parser<T> => new Parser(state => succUpdate(state, value, 0));

/**
 * Matches any element.
 *
 * @example any.parse([someValue]).value === someValue;
 * @example any.parse([]); // parse fail
 */
export const anyEl = new Parser(
    state =>
        state.pos < state.target.length
            ? succUpdate(state, state.target[state.pos], 1)
            : failFromSucc(state),
);

export const satisfy = <R>(
    f: ((el: unknown) => boolean) | ((el: unknown) => el is R),
): Parser<R> =>
    new Parser(state => {
        let el: unknown;
        return state.pos < state.target.length && f(el = state.target[state.pos])
            ? succUpdate(state, el, 1)
            : failFromSucc(state);
    });
