import { isArrayLike } from "emnorst";
import { ParseState, Success, succInit, Target } from "./state";

type ParseRunner<R1, R2> = (this: void, state: Success<R1>) => ParseState<R2>;

export class Parser<R> {
    constructor(readonly run: ParseRunner<unknown, R>) {}
    parse(this: Parser<R>, target: Target): ParseState<R> {
        if(!isArrayLike(target)) {
            throw new TypeError("target is not ArrayLike.");
        }
        const initState = succInit(target);
        const finalState = this.run(initState);
        return finalState;
    }
}
