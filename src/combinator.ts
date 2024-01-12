import { MAX_INT32, clamp } from "emnorst";
import type { Config } from ".";
import { type Parsed, Parser, type Source } from "./parser";
import { type ParseState, updateState } from "./state";

/**
 * Delays variable references until the parser runs.
 */
export const lazy = <T, S>(getParser: () => Parser<T, S>): Parser<T, S> => {
    let parser: Parser<T, S>;
    return new Parser((state, context) => {
        if (parser == null) {
            parser = getParser();
        }
        return parser.run(state, context);
    });
};

export const notFollowedBy = <S>(parser: Parser<unknown, S>): Parser<unknown, S> =>
    new Parser((state, context) => {
        const newState = parser.run(state, context);
        if (newState == null) {
            return state;
        }
        context.addError(state.i);
        return null;
    });

export const lookAhead = <T, S = unknown>(parser: Parser<T, S>): Parser<T, S> =>
    new Parser((state, context) => {
        const newState = parser.run(state, context);
        return newState && updateState(state, newState.v);
    });

type Seq<out T extends readonly Parser[]> = {
    [K in keyof T]: Parsed<T[K]>;
};

export const seq: {
    <T extends readonly Parser[] | []>(
        parsers: T,
        options?: { allowPartial?: false },
    ): Parser<Seq<T>, Source<T[number]>>;
    <T extends readonly Parser[] | []>(
        parsers: T,
        options: { allowPartial: boolean },
    ): Parser<Partial<Seq<T>>, Source<T[number]>>;
} = (parsers, options) =>
    new Parser((state, context) => {
        const values: unknown[] = [];
        for (const parser of parsers) {
            const newState = parser.run(state, context as never);
            if (newState == null) {
                if (options?.allowPartial) break;
                return null;
            }
            values.push((state = newState).v);
        }
        return updateState(state, values);
    });

type Choice<T extends readonly Parser[]> = Parser<Parsed<T[number]>, Source<T[number]>>;

export const choice = <T extends readonly Parser[] | []>(parsers: T): Choice<T> =>
    new Parser((state, context) => {
        for (const parser of parsers) {
            const newState = parser.run(state, context as never);
            if (newState != null) {
                return newState as ParseState<Parsed<T[number]>>;
            }
        }
        return null;
    });

export const manyAccum = <T, U, S>(
    parser: Parser<T, S>,
    f: (accum: U, cur: T, config: Config) => U | void,
    init: (config: Config) => U,
    options?: { min?: number; max?: number },
): Parser<U, S> => {
    const clampedMin = clamp(options?.min || 0, 0, MAX_INT32) | 0;
    const clampedMax = clamp(options?.max || MAX_INT32, clampedMin, MAX_INT32) | 0;

    return new Parser((state, context) => {
        let accum: U = init(context.cfg);
        for (let i = 0; i < clampedMax; i++) {
            const newState = parser.run(state, context);
            if (newState == null) {
                if (i < clampedMin) return null;
                break;
            }
            accum = f(accum, (state = newState).v, context.cfg) ?? accum;
        }
        return updateState(state, accum);
    });
};

export const many = <T, S>(
    parser: Parser<T, S>,
    options?: { min?: number; max?: number },
): Parser<T[], S> => {
    return manyAccum<T, T[], S>(
        parser,
        (array, value) => {
            array.push(value);
        },
        () => [],
        options,
    );
};
