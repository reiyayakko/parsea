import type { Config } from "./context";
import { Parser } from "./parser";
import { Failure, updateSucc } from "./state";

const PARSEA_ERROR = Symbol("Parsea.error");

interface ParseaError {
    [PARSEA_ERROR]: Failure;
}

export const isParseaError = (e: unknown): e is ParseaError =>
    e != null && PARSEA_ERROR in (e as object);

interface Perform {
    <T>(parser: Parser<T>): T;
}

export const qo = <T>(runner: (perform: Perform, config: Config) => T): Parser<T> =>
    new Parser((state, context) => {
        try {
            const value = runner(parser => {
                const newState = parser.run(state, context);
                if (!newState.succ) {
                    throw { [PARSEA_ERROR]: newState };
                }
                return (state = newState).val;
            }, context.config);
            return updateSucc(state, value, 0);
        } catch (err) {
            if (isParseaError(err)) {
                return err[PARSEA_ERROR];
            }
            throw err;
        }
    });
