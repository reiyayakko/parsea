import { isArrayLike } from "emnorst";
import { ParseState, Success, succInit, Target } from "./state";

type ParseRunner<T, U> = (this: void, state: Success<T>) => ParseState<U>;

export class Parser<T> {
    constructor(readonly run: ParseRunner<unknown, T>) {}
    parse(this: Parser<T>, target: Target): ParseState<T> {
        if(!isArrayLike(target)) {
            throw new TypeError("target is not ArrayLike.");
        }
        const initState = succInit(target);
        const finalState = this.run(initState);
        return finalState;
    }
}
