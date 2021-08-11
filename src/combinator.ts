import { Parser } from "./parser";
import { failFromSucc, margeFail } from "./state";

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
