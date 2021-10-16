import type { Config, Source } from "./context";
import { Parser } from "./parser";
import { failFrom, updateSucc } from "./state";

/**
 * Always succeed with the value of the argument.
 */
export const pure = <T>(value: T): Parser<T> =>
    new Parser(state => updateSucc(state, value, 0));

export const fail = (): Parser<never> =>
    new Parser((state, context) => failFrom(context, state.pos));

/**
 * end of input
 */
export const EOI = new Parser((state, context) =>
    state.pos < context.src.length ? failFrom(context, state.pos) : state,
);

/**
 * Matches any element.
 *
 * @example any.parse([someValue]).value === someValue;
 * @example any.parse([]); // parse fail
 */
export const ANY_EL = new Parser((state, context) =>
    state.pos < context.src.length
        ? updateSucc(state, context.src[state.pos], 1)
        : failFrom(context, state.pos),
);

export const el = <T>(value: T): Parser<T> => satisfy(srcEl => Object.is(srcEl, value));

export const satisfy = <T>(
    f:
        | ((el: unknown, config: Config) => boolean)
        | ((el: unknown, config: Config) => el is T),
): Parser<T> =>
    new Parser((state, context) => {
        let srcEl: unknown;
        return state.pos < context.src.length &&
            f((srcEl = context.src[state.pos]), context.config)
            ? updateSucc(state, srcEl, 1)
            : failFrom(context, state.pos);
    });

export const literal = <T extends Source>(chunk: T): Parser<T> =>
    new Parser((state, context) => {
        if (state.pos + chunk.length > context.src.length) {
            return failFrom(context, state.pos);
        }
        for (let i = 0; i < chunk.length; i++) {
            const srcEl = context.src[state.pos + i];
            const chunkEl = chunk[i];
            if (!Object.is(srcEl, chunkEl)) {
                return failFrom(context, state.pos + i);
            }
        }
        return updateSucc(state, chunk, chunk.length);
    });
