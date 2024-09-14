import type { JsonValue } from "emnorst";
import { type Parser, choice, el, eoi, lazy, literal, regex, sepBy, seq } from "parsea";

// https://www.json.org/

const ws = regex(/[ \n\r\t]*/);

const json: Parser<JsonValue, string> = lazy(() =>
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

// cspell:ignore bfnrt
const string = regex(/(?:\\(?:["\\/bfnrt]|u[0-9A-Fa-f]{4})|[^"\\])*/)
    .between(el('"'))
    .map(escapedString =>
        escapedString.replace(/\\(u[0-9A-Fa-f]{4}|.)/g, (_, escape: string) => {
            if (escape.startsWith("u")) {
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

const array = choice([json.apply(sepBy, el(",")), empty]).between(el("["), el("]"));

const keyValue = seq([string.between(ws).skip(el(":")), json]);

const object = choice([keyValue.apply(sepBy, el(",")), empty])
    .between(el("{"), el("}"))
    .map<Record<string, JsonValue>>(Object.fromEntries);

export const jsonParser = json.skip(eoi);
