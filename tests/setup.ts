import { ParseState, Parser } from "../src";

declare global {
    namespace jest {
        interface Matchers<R, T> {
            parseResultToEqual(result: ParseState<T extends Parser<infer U> ? U : never>): R;
        }
    }
}

const parseResultToEqual: jest.CustomMatcher = function(
    receivedParser: unknown,
    result: ParseState<unknown>,
) {
    const matcherName = "parseResultToEqual";
    const options: jest.MatcherHintOptions = {
        isNot: this.isNot,
        promise: this.promise,
    };

    if(!(receivedParser instanceof Parser)) {
        throw new Error(
            this.utils.matcherErrorMessage(
                this.utils.matcherHint(matcherName, void 0, void 0, options),
                `${this.utils.RECEIVED_COLOR("received")} value must be a Parser`,
                this.utils.printWithType("Received", receivedParser, this.utils.printReceived),
            ),
        );
    }

    const parseResult = receivedParser.parse(result.target);
    const pass = this.equals(parseResult, result);
    return {
        pass,
        message: () => 
            this.utils.matcherHint(matcherName, void 0, void 0, options)
                + "\n\n"
                + (this.utils.diff(parseResult, result) || ""),
    };
};

expect.extend({ parseResultToEqual });
