import { Parser } from "./parser";
import { failFrom, succUpdate, Source, Config } from "./state";

/**
 * Always succeed with the value of the argument.
 */
export const pure = <T>(value: T): Parser<T> => new Parser(state => succUpdate(state, value, 0));

export const fail = (): Parser<never> => new Parser(state => failFrom(state.src, state.pos));

/**
 * end of input
 */
export const EOI = new Parser(state =>
    state.pos < state.src.length ? failFrom(state.src, state.pos) : state
);

/**
 * Matches any element.
 *
 * @example any.parse([someValue]).value === someValue;
 * @example any.parse([]); // parse fail
 */
export const ANY_EL = new Parser(
    state =>
        state.pos < state.src.length
            ? succUpdate(state, state.src[state.pos], 1)
            : failFrom(state.src, state.pos),
);

export const el = <T>(value: T): Parser<T> => satisfy(srcEl => Object.is(srcEl, value));

export const satisfy = <T>(
    f: ((el: unknown, config: Config) => boolean) | ((el: unknown, config: Config) => el is T),
): Parser<T> =>
    new Parser(state => {
        let srcEl: unknown;
        return state.pos < state.src.length && f(srcEl = state.src[state.pos], state.config)
            ? succUpdate(state, srcEl, 1)
            : failFrom(state.src, state.pos);
    });

export const literal = <T extends Source>(chunk: T): Parser<T> =>
    new Parser<T>(state => {
        if(state.pos + chunk.length > state.src.length) {
            return failFrom(state.src, state.pos);
        }
        for(let i = 0; i < chunk.length; i++) {
            const srcEl = state.src[state.pos + i];
            const chunkEl = chunk[i];
            if(!Object.is(srcEl, chunkEl)) {
                return failFrom(state.src, state.pos + i);
            }
        }
        return succUpdate(state, chunk, chunk.length);
    });
