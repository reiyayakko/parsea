import { MAX_INT32, clamp, isArrayLike } from "emnorst";
import { Context, type Config, type Source } from "./context";
import { createParseResult, type ParseResult } from "./result";
import { initState, updateState, type ParseState } from "./state";

export type Parsed<T> = T extends Parser<infer U> ? U : never;

export type ParseRunner<in T, out U> = (
    this: void,
    state: ParseState<T>,
    context: Context,
) => ParseState<U> | null;

export class Parser<out T = unknown> {
    constructor(readonly run: ParseRunner<unknown, T>) {}
    parse(this: Parser<T>, source: Source, config: Config = {}): ParseResult<T> {
        if (!isArrayLike(source)) {
            throw new TypeError("source is not ArrayLike.");
        }
        const context = new Context(source, config);
        const finalState = this.run(initState, context);
        return createParseResult(finalState, context);
    }
    return<U>(this: Parser, value: U): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && updateState(newState, value);
        });
    }
    map<U>(this: Parser<T>, f: (value: T, config: Config) => U): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && updateState(newState, f(newState.v, context.cfg));
        });
    }
    flatMap<U>(this: Parser<T>, f: (value: T, config: Config) => Parser<U>): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && f(newState.v, context.cfg).run(newState, context);
        });
    }
    then<U>(this: Parser, parser: Parser<U>): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState && parser.run(newState, context);
        });
    }
    skip(this: Parser<T>, parser: Parser): Parser<T> {
        return new Parser((state, context) => {
            const newStateA = this.run(state, context);
            const newStateB = newStateA && parser.run(newStateA, context);
            return newStateB && updateState(newStateB, newStateA.v);
        });
    }
    and<U>(this: Parser<T>, parser: Parser<U>): Parser<[T, U]> {
        return this.andMap(parser, (a, b) => [a, b]);
    }
    andMap<U, V>(
        this: Parser<T>,
        parser: Parser<U>,
        zip: (left: T, right: U) => V,
    ): Parser<V> {
        return new Parser((state, context) => {
            const newStateA = this.run(state, context);
            const newStateB = newStateA && parser.run(newStateA, context);
            return newStateB && updateState(newStateB, zip(newStateA.v, newStateB.v));
        });
    }
    between<T>(this: Parser<T>, pre: Parser, post = pre): Parser<T> {
        return new Parser((state, context) => {
            const newStateA = pre.run(state, context);
            const newStateB = newStateA && this.run(newStateA, context);
            const newStateC = newStateB && post.run(newStateB, context);
            return newStateC && updateState(newStateC, newStateB.v);
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
            return this.run(state, context) ?? updateState(state, value);
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
                accum = f(accum, (state = newState).v, context.cfg) ?? accum;
            }
            return updateState(state, accum);
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
