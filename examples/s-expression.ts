import { type Parser, choice, el, lazy, many, regex } from "parsea";

export type SExpression = string | readonly SExpression[];

const list = lazy(() => SExpression)
    .apply(many)
    .between(el("("), el(")"));

export const SExpression: Parser<SExpression, string> = choice([
    el("'").then(list.map(list => ["quote", ...list])),
    list,
    regex(/"([^"\\]|\\.)*"/),
    regex(/[^\s()"]+/),
]).between(regex(/\s*/));
