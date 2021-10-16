import type { Config, Context, Source } from "../src/context";
import { Parser, Parsed } from "../src/parser";
import { ParseState, succUpdate, succInit, failFrom } from "../src/state";

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

    const parseResult = receivedParser.parse(context.src, context.config);
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
        config: Config = {},
    ) {
        return parseToEqual.call(
            this,
            receivedParser,
            succUpdate(succInit, value, pos),
            { src, config },
            "parseToSucc",
        );
    },
    parseToFail(receivedParser: unknown, src: Source, pos: number, config: Config = {}) {
        const context = { src, config };
        return parseToEqual.call(
            this,
            receivedParser,
            failFrom(context, pos),
            context,
            "parseToFail",
        );
    },
});
