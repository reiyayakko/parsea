import { isArrayLike, clamp, MAX_INT32 } from "emnorst";
import type { Config, Context, Source } from "./context";
import { ParseState, initState, updateState } from "./state";

export type Parsed<T> = T extends Parser<infer U> ? U : never;

type ParseRunner<in T, out U> = (
    this: void,
    state: ParseState<T>,
    context: Context,
) => ParseState<U> | null;

export class Parser<out T> {
    constructor(readonly run: ParseRunner<unknown, T>) {}
    parse(this: Parser<T>, src: Source, cfg: Config = {}): ParseState<T> | null {
        if (!isArrayLike(src)) {
            throw new TypeError("source is not ArrayLike.");
        }
        const context: Context = { src, cfg, errs: [] };
        const finalState = this.run(initState, context);
        return finalState;
    }
    return<U>(this: Parser<unknown>, value: U): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && updateState(newState, value, 0);
        });
    }
    map<U>(this: Parser<T>, f: (value: T, config: Config) => U): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && updateState(newState, f(newState.val, context.cfg), 0);
        });
    }
    flatMap<U>(this: Parser<T>, f: (value: T, config: Config) => Parser<U>): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && f(newState.val, context.cfg).run(newState, context);
        });
    }
    and<U>(this: Parser<unknown>, parser: Parser<U>, skip?: false): Parser<U>;
    and(this: Parser<T>, parser: Parser<unknown>, skip: true): Parser<T>;
    and<U>(this: Parser<T>, parser: Parser<U>, skip: boolean): Parser<T | U>;
    and<U>(this: Parser<T>, parser: Parser<U>, skip = false): Parser<T | U> {
        return new Parser<T | U>((state, context) => {
            const newStateA = this.run(state, context);
            if (newStateA == null) return null;
            const newStateB = parser.run(newStateA, context);
            if (newStateB == null) return null;
            return skip ? updateState(newStateB, newStateA.val, 0) : newStateB;
        });
    }
    between<T>(this: Parser<T>, pre: Parser<unknown>, post = pre): Parser<T> {
        return new Parser((state, context) => {
            const newStateA = pre.run(state, context);
            const newStateB = newStateA && this.run(newStateA, context);
            const newStateC = newStateB && post.run(newStateB, context);
            return newStateC && updateState(newStateC, newStateB.val, 0);
        });
    }
    or<U>(this: Parser<T>, parser: Parser<U>): Parser<T | U> {
        return new Parser<T | U>((state, context) => {
            return this.run(state, context) ?? parser.run(state, context);
        });
    }
    option(this: Parser<T>): Parser<T | null>;
    option<U>(this: Parser<T>, value: U): Parser<T | U>;
    option<U = null>(this: Parser<T>, value: U = null as unknown as U): Parser<T | U> {
        return new Parser<T | U>((state, context) => {
            return this.run(state, context) ?? updateState(state, value, 0);
        });
    }
    manyAccum<U>(
        this: Parser<T>,
        f: (accum: U, cur: T, config: Config) => U | void,
        init: (config: Config) => U,
        options?: { min?: number; max?: number },
    ): Parser<U> {
        const clampedMin = clamp(options?.min || 0, 0, MAX_INT32) | 0;
        const clampedMax = clamp(options?.max || MAX_INT32, clampedMin, MAX_INT32) | 0;

        return new Parser((state, context) => {
            let accum: U = init(context.cfg);
            for (let i = 0; i < clampedMax; i++) {
                const newState = this.run(state, context);
                if (newState == null) {
                    if (i < clampedMin) return null;
                    break;
                }
                accum = f(accum, (state = newState).val, context.cfg) ?? accum;
            }
            return updateState(state, accum, 0);
        });
    }
    many(this: Parser<T>, options?: { min?: number; max?: number }): Parser<T[]> {
        return this.manyAccum<T[]>(
            (array, value) => {
                array.push(value);
            },
            () => [],
            options,
        );
    }
}
