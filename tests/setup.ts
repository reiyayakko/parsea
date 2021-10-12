import { Parser, Parsed } from "../src/parser";
import { Config, ParseState, succUpdate, succInit, Source, failFrom } from "../src/state";

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

    const parseResult = receivedParser.parse(result.src);
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
    parseToEqual(receivedParser: unknown, result: ParseState<unknown>) {
        return parseToEqual.call(this, receivedParser, result, "parseToEqual");
    },
    parseToSucc(
        receivedParser: unknown,
        source: Source,
        pos: number,
        value: unknown,
        config: Config = {},
    ) {
        return parseToEqual.call(
            this,
            receivedParser,
            succUpdate(succInit(source, config), value, pos),
            "parseToSucc",
        );
    },
    parseToFail(receivedParser: unknown, source: Source, pos: number) {
        return parseToEqual.call(
            this,
            receivedParser,
            failFrom(source, pos),
            "parseToFail",
        );
    },
});
