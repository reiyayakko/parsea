import { MAX_INT32, clamp } from "emnorst";
import type { Config } from ".";
import { type Parsed, Parser, type Source } from "./parser";
import { type ParseState, updateState } from "./state";

/**
 * Delays variable references until the parser runs.
 */
export const lazy = <T, S>(getParser: () => Parser<T, S>): Parser<T, S> => {
    const lazyParser: Parser<T, S> = new Parser((state, context) => {
        // @ts-expect-error readonly
        return (lazyParser.run = getParser().run)(state, context);
    });
    return lazyParser;
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

export const many = <T, S>(
    parser: Parser<T, S>,
    options?: { min?: number; max?: number },
): Parser<T[], S> => {
    const min = clamp(options?.min || 0, 0, MAX_INT32) | 0;
    const max = clamp(options?.max || MAX_INT32, min, MAX_INT32) | 0;

    return new Parser((state, context) => {
        const result: T[] = [];
        while (result.length < max) {
            const newState = parser.run(state, context);
            if (newState == null || !(state.i < newState.i)) break;
            result.push((state = newState).v);
        }
        return result.length < min ? null : updateState(state, result);
    });
};

/**
 * To require the trailing {@link separator}, use {@link many} with `parser.skip(separator)`.
 */
export const sepBy = <T, S>(
    parser: Parser<T, S>,
    separator: Parser<unknown, S>,
    options?: { min?: number; max?: number; trailing?: "none" | "allow" },
): Parser<T[], S> => {
    const min = clamp(options?.min || 0, 0, MAX_INT32) | 0;
    const max = clamp(options?.max || MAX_INT32, min, MAX_INT32) | 0;

    return new Parser((state, context) => {
        const result: T[] = [];
        let beforeSeparatorState = state;
        while (result.length < max) {
            const startState = state;
            const newStateA = parser.run(state, context);
            if (newStateA == null) {
                if (options?.trailing !== "allow") {
                    state = beforeSeparatorState;
                }
                break;
            }
            if (options?.trailing !== "allow") {
                beforeSeparatorState = newStateA;
            }
            result.push((state = newStateA).v);
            const newStateB = separator.run(newStateA, context);
            if (newStateB == null) break;

            if (!(startState.i < newStateB.i)) break;
            state = newStateB;
        }
        return result.length < min ? null : updateState(state, result);
    });
};
