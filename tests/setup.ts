import { Parser } from "../src/parser";
import { ParseState, succUpdate, succInit, Target, failFrom } from "../src/state";

type InferFromParser<T> = T extends Parser<infer U> ? U : never;

declare global {
    namespace jest {
        interface Matchers<R, T> {
            parseToEqual(result: ParseState<InferFromParser<T>>): R;
            parseToSucc(target: Target, pos: number, value: InferFromParser<T>): R;
            parseToFail(target: Target, pos: number): R;
        }
    }
}

const parseToEqual = function(
    this: jest.MatcherContext,
    receivedParser: unknown,
    result: ParseState<unknown>,
    matcherName: string,
): jest.CustomMatcherResult {
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
    const message = () => {
        const hint = this.utils.matcherHint(matcherName, void 0, void 0, options) + "\n\n";
        return hint + this.utils.printDiffOrStringify(
            parseResult,
            result,
            "Expected",
            "Received",
            this.expand !== false,
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
        target: Target,
        pos: number,
        value: unknown,
    ) {
        return parseToEqual.call(
            this,
            receivedParser,
            succUpdate(succInit(target), value, pos),
            "parseToSucc",
        );
    },
    parseToFail(
        receivedParser: unknown,
        target: Target,
        pos: number,
    ) {
        return parseToEqual.call(
            this,
            receivedParser,
            failFrom(target, pos),
            "parseToFail",
        );
    },
});
