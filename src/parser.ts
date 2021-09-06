import { isArrayLike, MAX_BIT_NUMBER as MAX_INT32 } from "emnorst";
import { Config, margeFail, ParseState, Success, succInit, succUpdate, Source } from "./state";
import { clamp } from "./util";

type ParseRunner<T, U> = (this: void, state: Success<T>) => ParseState<U>;

export class Parser<T> {
    constructor(readonly run: ParseRunner<unknown, T>) {}
    parse(this: Parser<T>, source: Source, config: Config = {}): ParseState<T> {
        if(!isArrayLike(source)) {
            throw new TypeError("source is not ArrayLike.");
        }
        const initState = succInit(source, config);
        const finalState = this.run(initState);
        return finalState;
    }
    map<U>(this: Parser<T>, f: (t: T) => U): Parser<U> {
        return new Parser(state => {
            const newState = this.run(state);
            return newState.succ ? succUpdate(newState, f(newState.val), 0) : newState;
        });
    }
    flatMap<U>(this: Parser<T>, f: (r: T) => Parser<U>): Parser<U> {
        return new Parser(state => {
            const newState = this.run(state);
            return newState.succ ? f(newState.val).run(newState) : newState;
        });
    }
    right<U>(this: Parser<T>, parser: Parser<U>): Parser<U> {
        return new Parser(state => {
            const newState = this.run(state);
            return newState.succ ? parser.run(newState) : newState;
        });
    }
    left(this: Parser<T>, parser: Parser<unknown>): Parser<T> {
        return new Parser(state => {
            const newStateA = this.run(state);
            if(!newStateA.succ) return newStateA;
            const newStateB = parser.run(newStateA);
            if(!newStateB.succ) return newStateB;
            return succUpdate(newStateB, newStateA.val, 0);
        });
    }
    or<U>(this: Parser<T>, parser: Parser<U>): Parser<T | U> {
        return new Parser<T | U>(state => {
            const newStateA = this.run(state);
            if(newStateA.succ) return newStateA;
            const newStateB = parser.run(state);
            if(newStateB.succ) return newStateB;
            return margeFail(newStateA, newStateB);
        });
    }
    many(this: Parser<T>, options?: { min?: number; max?: number }): Parser<T[]> {
        const clampedMin = clamp(options?.min || 0, 0, MAX_INT32) | 0;
        const clampedMax = clamp(options?.max || MAX_INT32, clampedMin, MAX_INT32) | 0;

        return new Parser(state => {
            const accum: T[] = [];
            for(let i = 0; i < clampedMax; i++) {
                const newState = this.run(state);
                if(!newState.succ) {
                    if(i < clampedMin) return newState;
                    break;
                }
                accum.push(newState.val);
                state = newState;
            }
            return succUpdate(state, accum, 0);
        });
    }
}
