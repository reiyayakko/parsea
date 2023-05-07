import { equals } from "emnorst";
import { pushError, type Config, type Source } from "./context";
import { Parser } from "./parser";
import { updateState } from "./state";

/**
 * Always succeed with the value of the argument.
 */
export const pure = <T>(value: T): Parser<T> =>
    new Parser(state => updateState(state, value, 0));

export const fail = (): Parser<never> =>
    new Parser((state, context) => {
        pushError(context, state.pos);
        return null;
    });

/**
 * end of input
 */
export const EOI = /* #__PURE__ */ new Parser((state, context) => {
    if (state.pos < context.src.length) {
        pushError(context, state.pos);
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
    if (state.pos < context.src.length) {
        return updateState(state, context.src[state.pos], 1);
    }
    pushError(context, state.pos);
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
            state.pos < context.src.length &&
            f((srcEl = context.src[state.pos]), context.cfg)
        ) {
            return updateState(state, srcEl, 1);
        }
        pushError(context, state.pos);
        return null;
    });

export const literal = <T extends Source>(chunk: T): Parser<T> =>
    new Parser((state, context) => {
        if (state.pos + chunk.length > context.src.length) {
            pushError(context, state.pos);
            return null;
        }
        for (let i = 0; i < chunk.length; i++) {
            const srcEl = context.src[state.pos + i];
            const chunkEl = chunk[i];
            if (!equals(srcEl, chunkEl)) {
                pushError(context, state.pos + i);
                return null;
            }
        }
        return updateState(state, chunk, chunk.length);
    });
