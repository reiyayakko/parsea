import { equals } from "emnorst";
import type { Config } from "./context";
import * as error from "./error";
import { Parser } from "./parser";
import { updateState } from "./state";

/**
 * Always succeed with the value of the argument.
 */
export const pure = <const T>(value: T): Parser<T, unknown> =>
    new Parser(state => updateState(state, value));

export const fail = (): Parser<never, unknown> =>
    new Parser((state, context) => {
        context.addError(state.i);
        return null;
    });

/**
 * end of input
 */
export const EOI = /* #__PURE__ */ new Parser<unknown, unknown>((state, context) => {
    if (state.i < context.src.length) {
        context.addError(state.i);
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
export const ANY_EL = /* #__PURE__ */ new Parser<unknown, unknown>((state, context) => {
    if (state.i < context.src.length) {
        return updateState(state, context.src[state.i], 1);
    }
    context.addError(state.i);
    return null;
});

export const el = <const T>(value: T): Parser<T, unknown> =>
    satisfy(srcEl => equals(srcEl, value), {
        error: error.expected(
            typeof value === "string" && value.length === 1 ? value : [value],
        ),
    });

export const oneOf = <const T>(values: Iterable<T>): Parser<T, unknown> => {
    const set = new Set<unknown>(values);
    return satisfy(el => set.has(el));
};

export const noneOf = (values: Iterable<unknown>): Parser<unknown, unknown> => {
    const set = new Set(values);
    return satisfy(el => !set.has(el));
};

export const satisfy = <T extends S, S = unknown>(
    f: ((el: S, config: Config) => boolean) | ((el: S, config: Config) => el is T),
    options?: { error?: error.ParseError },
): Parser<T, S> =>
    new Parser((state, context) => {
        let srcEl: unknown;
        if (
            state.i < context.src.length &&
            f((srcEl = context.src[state.i]), context.cfg)
        ) {
            return updateState(state, srcEl as T, 1);
        }
        context.addError(state.i, options?.error);
        return null;
    });

export const literal = <const T extends ArrayLike<unknown>>(
    chunk: T,
): Parser<T, unknown> =>
    new Parser((state, context) => {
        if (state.i + chunk.length > context.src.length) {
            context.addError(state.i, error.expected(chunk));
            return null;
        }
        for (let i = 0; i < chunk.length; i++) {
            const srcEl = context.src[state.i + i];
            const chunkEl = chunk[i];
            if (!equals(srcEl, chunkEl)) {
                context.addError(state.i, error.expected(chunk));
                return null;
            }
        }
        return updateState(state, chunk, chunk.length);
    });
