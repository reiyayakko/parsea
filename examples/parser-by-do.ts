import { Config, Parser, qo } from "../src";

// For simplicity, the behavior may differ in a few cases.

const pure = <T>(val: T) => qo(() => val);

const map = <T, U>(parser: Parser<T>, f: (v: T, config: Config) => U) =>
    qo((perform, config) => f(perform(parser), config));

const flatMap = <T, U>(parser: Parser<T>, f: (v: T, config: Config) => Parser<U>) =>
    qo((perform, config) => perform(f(perform(parser), config)));

const right = <T>(left: Parser<unknown>, right: Parser<T>) =>
    qo(perform => (perform(left), perform(right)));

const left = <T>(left: Parser<T>, right: Parser<unknown>) =>
    qo(perform => {
        const leftVal = perform(left);
        perform(right);
        return leftVal;
    });

const or = <T, U>(left: Parser<T>, right: Parser<U>) =>
    qo(perform => {
        try {
            return perform(left);
        } catch (err) {
            return perform(right);
        }
    });

const seq = <T>(
    parsers: readonly Parser<T>[],
    options?: { droppable?: boolean },
): Parser<T[]> =>
    qo(perform => {
        const accum: T[] = [];
        try {
            for (const parser of parsers) {
                const val = perform(parser);
                accum.push(val);
            }
        } catch (err) {
            if (!options?.droppable) {
                throw err;
            }
        }
        return accum;
    });
