import { Parser } from "./parser";
import { failFromSucc, margeFail, succUpdate } from "./state";

export const seq = <T>(parsers: Parser<T>[]): Parser<T[]> =>
    new Parser(state => {
        const accum: T[] = [];
        for(let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state);
            if(!newState.succ) {
                return newState;
            }
            accum.push(newState.value);
            state = newState;
        }
        return succUpdate(state, accum, 0);
    });

export const choice = <T>(parsers: Parser<T>[]): Parser<T> =>
    new Parser(state => {
        let fail = failFromSucc(state);
        for(let i = 0; i < parsers.length; i++) {
            const newState = parsers[i].run(state);
            if(newState.succ) {
                return newState;
            }
            fail = margeFail(fail, newState);
        }
        return fail;
    });
