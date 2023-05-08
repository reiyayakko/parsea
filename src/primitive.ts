import { equals } from "emnorst";
import type { Config, Source } from "./context";
import * as error from "./error";
import { Parser } from "./parser";
import { updateState } from "./state";

/**
 * Always succeed with the value of the argument.
 */
export const pure = <T>(value: T): Parser<T> =>
    new Parser(state => updateState(state, value, 0));

export const fail = (): Parser<never> =>
    new Parser((state, context) => {
        context.addError(error.unknown(state.i));
        return null;
    });

/**
 * end of input
 */
export const EOI = /* #__PURE__ */ new Parser((state, context) => {
    if (state.i < context.src.length) {
        context.addError(error.unknown(state.i));
        return null;
    }
    return state;
});

/**
 * Matches any element.
 *
 * @example any.parse([someValue]).value === someValue;
 * @example any.parse([]); // parse fail
 */
export const ANY_EL = /* #__PURE__ */ new Parser((state, context) => {
    if (state.i < context.src.length) {
        return updateState(state, context.src[state.i], 1);
    }
    context.addError(error.unknown(state.i));
    return null;
});

export const el = <T>(value: T): Parser<T> => satisfy(srcEl => equals(srcEl, value));

export const oneOf = <T>(values: Iterable<T>): Parser<T> => {
    const set = new Set<unknown>(values);
    return satisfy(el => set.has(el));
};

export const noneOf = (values: Iterable<unknown>): Parser<unknown> => {
    const set = new Set(values);
    return satisfy(el => !set.has(el));
};

export const satisfy = <T>(
    f:
        | ((el: unknown, config: Config) => boolean)
        | ((el: unknown, config: Config) => el is T),
): Parser<T> =>
    new Parser((state, context) => {
        let srcEl: unknown;
        if (
            state.i < context.src.length &&
            f((srcEl = context.src[state.i]), context.cfg)
        ) {
            return updateState(state, srcEl, 1);
        }
        context.addError(error.unknown(state.i));
        return null;
    });

export const literal = <T extends Source>(chunk: T): Parser<T> =>
    new Parser((state, context) => {
        if (state.i + chunk.length > context.src.length) {
            context.addError(error.unknown(state.i));
            return null;
        }
        for (let i = 0; i < chunk.length; i++) {
            const srcEl = context.src[state.i + i];
            const chunkEl = chunk[i];
            if (!equals(srcEl, chunkEl)) {
                context.addError(error.unknown(state.i + i));
                return null;
            }
        }
        return updateState(state, chunk, chunk.length);
    });
