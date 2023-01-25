import type { JsonValue } from "emnorst";
import { EOI, choice, el, lazy, literal, Parser, qo, regex, seq } from "../src";

const sepBy = <T>(parser: Parser<T>, sep: Parser<unknown>) =>
    qo(perform => {
        const head = perform(parser);
        const rest = perform(sep.and(parser).many());
        return [head, ...rest];
    });

// https://www.json.org/

const ws = regex(/[ \n\r\t]*/);

const jsonValue: Parser<JsonValue> = lazy(() =>
    choice<JsonValue>([
        object,
        array,
        string,
        number,
        literal("true").map(() => true),
        literal("false").map(() => false),
        literal("null").map(() => null),
    ]).between(ws),
);

const escapeTable = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
};

const string = regex(/(?:\\(?:["\\/bfnrt]|u[0-9A-Fa-f]{4})|[^"\\])*/)
    .between(el('"'))
    .map(escapedString =>
        escapedString.replace(/\\(u[0-9A-Fa-f]{4}|.)/g, (_, escape: string) => {
            if (escape[0] === "u") {
                return String.fromCharCode(parseInt(escape.slice(1), 16));
            }
            if (escape in escapeTable) {
                return escapeTable[escape as keyof typeof escapeTable];
            }
            return escape;
        }),
    );

const number = regex(/-?(0|[1-9]\d*)(.\d+)?([Ee][-+]?\d+)?/).map(Number);

const empty = ws.map<[]>(() => []);

const array = sepBy(jsonValue, el(",")).or(empty).between(el("["), el("]"));

const keyValue = seq([ws.and(string), ws.and(el(":")).and(jsonValue)]);

const object = sepBy(keyValue, el(","))
    .or(empty)
    .between(el("{"), el("}"))
    .map<Record<string, JsonValue>>(Object.fromEntries);

export const jsonParser = jsonValue.and(EOI, true);
