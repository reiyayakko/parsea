import { isArrayLike, clamp, MAX_INT32 } from "emnorst";
import type { Config, Context, Source } from "./context";
import { margeFail, ParseState, Success, succInit, updateSucc } from "./state";

export type Parsed<T> = T extends Parser<infer U> ? U : never;

type ParseRunner<T, U> = (
    this: void,
    state: Success<T>,
    context: Context,
) => ParseState<U>;

export class Parser<T> {
    constructor(readonly run: ParseRunner<unknown, T>) {}
    parse(this: Parser<T>, src: Source, cfg: Config = {}): ParseState<T> {
        if (!isArrayLike(src)) {
            throw new TypeError("source is not ArrayLike.");
        }
        const context: Context = { src, cfg };
        const finalState = this.run(succInit, context);
        return finalState;
    }
    map<U>(this: Parser<T>, f: (val: T, config: Config) => U): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState.succ
                ? updateSucc(newState, f(newState.val, context.cfg), 0)
                : newState;
        });
    }
    flatMap<U>(this: Parser<T>, f: (val: T, config: Config) => Parser<U>): Parser<U> {
        return new Parser((state, context) => {
            const newState = this.run(state, context);
            return newState.succ
                ? f(newState.val, context.cfg).run(newState, context)
                : newState;
        });
    }
    and<U>(this: Parser<unknown>, parser: Parser<U>): Parser<U>;
    and(this: Parser<T>, parser: Parser<unknown>, skip: true): Parser<T>;
    and<U>(this: Parser<T>, parser: Parser<U>, skip: boolean): Parser<T | U>;
    and<U>(this: Parser<T>, parser: Parser<U>, skip = false): Parser<T | U> {
        return new Parser<T | U>((state, context) => {
            const newStateA = this.run(state, context);
            if (!newStateA.succ) return newStateA;
            const newStateB = parser.run(newStateA, context);
            if (!newStateB.succ) return newStateB;
            return skip ? updateSucc(newStateB, newStateA.val, 0) : newStateB;
        });
    }
    or<U>(this: Parser<T>, parser: Parser<U>): Parser<T | U> {
        return new Parser<T | U>((state, context) => {
            const newStateA = this.run(state, context);
            if (newStateA.succ) return newStateA;
            const newStateB = parser.run(state, context);
            if (newStateB.succ) return newStateB;
            return margeFail(newStateA, newStateB);
        });
    }
    manyAccum<U>(
        this: Parser<T>,
        f: (accum: U, cur: T, config: Config) => U,
        init: (config: Config) => U,
        options?: { min?: number; max?: number },
    ): Parser<U> {
        const clampedMin = clamp(options?.min || 0, 0, MAX_INT32) | 0;
        const clampedMax = clamp(options?.max || MAX_INT32, clampedMin, MAX_INT32) | 0;

        return new Parser((state, context) => {
            let accum: U = init(context.cfg);
            for (let i = 0; i < clampedMax; i++) {
                const newState = this.run(state, context);
                if (!newState.succ) {
                    if (i < clampedMin) return newState;
                    break;
                }
                accum = f(accum, (state = newState).val, context.cfg);
            }
            return updateSucc(state, accum, 0);
        });
    }
    many(this: Parser<T>, options?: { min?: number; max?: number }): Parser<T[]> {
        const pushed = <T>(arr: T[], val: T) => {
            arr.push(val);
            return arr;
        };
        return this.manyAccum<T[]>(pushed, () => [], options);
    }
}
