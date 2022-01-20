import type { Config, Context, Source } from "../src/context";
import { Parser, Parsed } from "../src/parser";
import { ParseState, updateSucc, succInit, failFrom } from "../src/state";

declare global {
    namespace jest {
        interface Matchers<R, T> {
            parseToEqual(result: ParseState<Parsed<T>>): R;
            parseToSucc(source: Source, pos: number, value: Parsed<T>): R;
            parseToFail(source: Source, pos: number): R;
        }
    }
}

const parseToEqual = function (
    this: jest.MatcherContext,
    receivedParser: unknown,
    result: ParseState<unknown>,
    context: Context,
    matcherName: string,
): jest.CustomMatcherResult {
    const options: jest.MatcherHintOptions = {
        isNot: this.isNot,
        promise: this.promise,
    };

    if (!(receivedParser instanceof Parser)) {
        throw new Error(
            this.utils.matcherErrorMessage(
                this.utils.matcherHint(matcherName, void 0, void 0, options),
                `${this.utils.RECEIVED_COLOR("received")} value must be a Parser`,
                this.utils.printWithType(
                    "Received",
                    receivedParser,
                    this.utils.printReceived,
                ),
            ),
        );
    }

    const parseResult = receivedParser.parse(context.src, context.cfg);
    const pass = this.equals(parseResult, result);
    const message = () => {
        const hint =
            this.utils.matcherHint(matcherName, void 0, void 0, options) + "\n\n";
        return (
            hint +
            this.utils.printDiffOrStringify(
                parseResult,
                result,
                "Expected",
                "Received",
                this.expand !== false,
            )
        );
    };
    return { pass, message };
};

expect.extend({
    parseToSucc(
        receivedParser: unknown,
        src: Source,
        pos: number,
        value: unknown,
        cfg: Config = {},
    ) {
        return parseToEqual.call(
            this,
            receivedParser,
            updateSucc(succInit, value, pos),
            { src, cfg },
            "parseToSucc",
        );
    },
    parseToFail(receivedParser: unknown, src: Source, pos: number, cfg: Config = {}) {
        const context = { src, cfg };
        return parseToEqual.call(
            this,
            receivedParser,
            failFrom(context, pos),
            context,
            "parseToFail",
        );
    },
});
