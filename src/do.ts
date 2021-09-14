import { Parser } from "./parser";
import { Failure, succUpdate, Config } from "./state";

const parseFailErrorRef = {};

type Perform = <T>(parser: Parser<T>) => T;

export const qo = <T>(runner: (perform: Perform, config: Config) => T): Parser<T> =>
    new Parser(state => {
        let fail: Failure;
        try {
            const value = runner(parser => {
                const newState = parser.run(state);
                if(!newState.succ) {
                    fail = newState;
                    throw parseFailErrorRef;
                }
                return (state = newState).val;
            }, state.config);
            return succUpdate(state, value, 0);
        } catch(err) {
            if(err === parseFailErrorRef && fail!) {
                return fail;
            }
            throw err;
        }
    });
