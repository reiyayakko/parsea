import { has } from "emnorst";
import type { Config } from "./context";
import { Parser } from "./parser";
import { updateState } from "./state";

const ParseaDoErrorSymbol = /* #__PURE__ */ Symbol();

interface Perform {
    <T>(parser: Parser<T>): T;
    try<T>(runner: () => T, allowPartialCommit?: boolean): T | null;
}

export const qo = <T>(runner: (perform: Perform, config: Config) => T): Parser<T> =>
    new Parser((state, context) => {
        const perform: Perform = parser => {
            const newState = parser.run(state, context);
            if (newState == null) {
                throw { [ParseaDoErrorSymbol]: null };
            }
            return (state = newState).v;
        };

        // !shouldRollbackState
        perform.try = (runner, allowPartialCommit) => {
            const beforeTryState = state;
            try {
                return runner();
            } catch (err) {
                if (!allowPartialCommit) {
                    state = beforeTryState;
                }
                if (has(err, ParseaDoErrorSymbol)) {
                    return null;
                }
                throw err;
            }
        };

        return perform.try(() => {
            const value = runner(perform, context.cfg);
            return updateState(state, value);
        });
    });
