import { has } from "emnorst";
import type { Config } from "./context";
import { Parser } from "./parser";
import { updateState } from "./state";

const ParseaDoErrorSymbol = /* #__PURE__ */ Symbol();

export type PerformOptions = {
    allowPartial?: boolean;
};

export type Perform<S> = {
    <T>(parser: Parser<T, S>, options?: PerformOptions): T;
    try<T, U>(defaultValue: T, runner: () => U): T | U;
};

export const qo = <T, S>(
    runner: (perform: Perform<S>, config: Config) => T,
): Parser<T, S> =>
    new Parser((state, context) => {
        const perform: Perform<S> = (parser, options) => {
            const newState = parser.run(state, context);
            if (newState == null) {
                throw { [ParseaDoErrorSymbol]: options };
            }
            return (state = newState).v;
        };

        perform.try = (defaultValue, runner) => {
            const beforeTryState = state;
            try {
                return runner();
            } catch (err) {
                if (!has(err, ParseaDoErrorSymbol)) {
                    throw err;
                }
                const options = err[ParseaDoErrorSymbol] as PerformOptions | undefined;
                if (!options?.allowPartial) {
                    state = beforeTryState;
                }
                return defaultValue;
            }
        };

        return perform.try(null, () => {
            const value = runner(perform, context.cfg);
            return updateState(state, value);
        });
    });
