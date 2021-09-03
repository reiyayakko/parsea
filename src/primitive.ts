import { Parser } from "./parser";
import { failFrom, succUpdate, Target } from "./state";

/**
 * Always succeed with the value of the argument.
 */
export const pure = <T>(value: T): Parser<T> => new Parser(state => succUpdate(state, value, 0));

/**
 * end of input
 */
export const eoi = new Parser(state =>
    state.pos < state.target.length ? failFrom(state.target, state.pos) : state
);

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
            : failFrom(state.target, state.pos),
);

export const el = <T>(value: T): Parser<T> => satisfy(targetEl => Object.is(targetEl, value));

export const satisfy = <T>(
    f: ((el: unknown) => boolean) | ((el: unknown) => el is T),
): Parser<T> =>
    new Parser(state => {
        let targetEl: unknown;
        return state.pos < state.target.length && f(targetEl = state.target[state.pos])
            ? succUpdate(state, targetEl, 1)
            : failFrom(state.target, state.pos);
    });

export const literal = <T extends Target>(chunk: T): Parser<T> =>
    new Parser<T>(state => {
        if(state.pos + chunk.length > state.target.length) {
            return failFrom(state.target, state.pos);
        }
        for(let i = 0; i < chunk.length; i++) {
            const targetEl = state.target[state.pos + i];
            const chunkEl = chunk[i];
            if(!Object.is(targetEl, chunkEl)) {
                return failFrom(state.target, state.pos + i);
            }
        }
        return succUpdate(state, chunk, chunk.length);
    });
