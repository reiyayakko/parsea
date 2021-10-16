import type { Config } from "./context";
import { Parser } from "./parser";
import { Failure, updateSucc } from "./state";

const parseFailErrorRef = {};

type Perform = <T>(parser: Parser<T>) => T;

export const qo = <T>(runner: (perform: Perform, config: Config) => T): Parser<T> =>
    new Parser((state, context) => {
        let fail: Failure;
        try {
            const value = runner(parser => {
                const newState = parser.run(state, context);
                if (!newState.succ) {
                    fail = newState;
                    throw parseFailErrorRef;
                }
                return (state = newState).val;
            }, context.config);
            return updateSucc(state, value, 0);
        } catch (err) {
            if (err === parseFailErrorRef && fail!) {
                return fail;
            }
            throw err;
        }
    });
