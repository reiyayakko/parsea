import type { Config } from "./context";
import { Parser } from "./parser";
import { updateState } from "./state";

const PARSEA_ERROR = Symbol("Parsea.error");

interface ParseaError {
    [PARSEA_ERROR]: null;
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
                if (newState == null) {
                    throw { [PARSEA_ERROR]: null };
                }
                return (state = newState).val;
            }, context.cfg);
            return updateState(state, value, 0);
        } catch (err) {
            if (isParseaError(err)) {
                return null;
            }
            throw err;
        }
    });
