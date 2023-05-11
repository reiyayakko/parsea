import type { JsonValue } from "emnorst";
import { EOI, choice, el, lazy, literal, qo, regex, seq, type Parser } from "../src";

const sepBy = <T>(parser: Parser<T>, sep: Parser) =>
    qo(perform => {
        const head = perform(parser);
        const rest = perform(sep.and(parser).many());
        return [head, ...rest];
    });

// https://www.json.org/

const ws = regex(/[ \n\r\t]*/);

const jsonValue: Parser<JsonValue> = lazy(() =>
    choice([
        object,
        array,
        string,
        number,
        literal("true").return(true),
        literal("false").return(false),
        literal("null").return(null),
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

export const jsonParser = jsonValue.skip(EOI);
