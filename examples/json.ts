import type { JsonValue } from "emnorst";
import { choice, el, eoi, lazy, literal, Parser, qo, regex, seq } from "../src";

const sepBy = <T>(parser: Parser<T>, sep: Parser<unknown>) =>
    qo(perform => {
        const head = perform(parser);
        const rest = perform(sep.right(parser).many());
        return [head, ...rest];
    });

const between = <T>(
    parser: Parser<T>,
    open: Parser<unknown>,
    close: Parser<unknown> = open,
): Parser<T> =>
    qo(perform => {
        perform(open);
        const val = perform(parser);
        perform(close);
        return val;
    });

// https://www.json.org/

const ws = regex(/[ \n\r\t]*/);

const jsonValue: Parser<JsonValue> = lazy(() =>
    between(choice<JsonValue>([
        object,
        array,
        string,
        number,
        literal("true").map(() => true),
        literal("false").map(() => false),
        literal("null").map(() => null),
    ]), ws),
);

const escapeTable = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
};

const string = between(regex(/(?:\\(?:["\\/bfnrt]|u[0-9A-Fa-f]{4})|[^"\\])*/), el("\""))
    .map(escapedString =>
        escapedString.replace(/\\(u[0-9A-Fa-f]{4}|.)/g, (_, escape: string) => {
            if(escape[0] === "u") {
                return String.fromCharCode(parseInt(escape.slice(1), 16));
            }
            if(escape in escapeTable) {
                return escapeTable[escape as keyof typeof escapeTable];
            }
            return escape;
        }),
    );

const number = regex(/-?(0|[1-9]\d*)(.\d+)?([Ee][-+]?\d+)?/).map(Number);

const empty = ws.map<[]>(() => []);

const array = between(sepBy(jsonValue, el(",")).or(empty), el("["), el("]"));

const keyValue = seq([ws.right(string), ws.right(el(":")).right(jsonValue)]);

const object = between(sepBy(keyValue, el(",")).or(empty), el("{"), el("}"))
    .map<Record<string, JsonValue>>(Object.fromEntries);

export const jsonParser = jsonValue.left(eoi);
