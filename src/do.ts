import { has } from "emnorst";
import type { Config } from "./context";
import { Parser } from "./parser";
import { updateState } from "./state";

const ParseaDoErrorSymbol = /* #__PURE__ */ Symbol();

export type Perform<S> = {
    <T>(parser: Parser<T, S>): T;
    try<T>(runner: () => T, allowPartialCommit?: boolean): T | null;
};

export const qo = <T, S>(
    runner: (perform: Perform<S>, config: Config) => T,
): Parser<T, S> =>
    new Parser((state, context) => {
        const perform: Perform<S> = parser => {
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
