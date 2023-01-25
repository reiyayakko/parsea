import { Config, Parser, qo } from "../src";

// For simplicity, the behavior may differ in a few cases.

const pure = <T>(value: T) => qo(() => value);

const map = <T, U>(parser: Parser<T>, f: (value: T, config: Config) => U) =>
    qo((perform, config) => f(perform(parser), config));

const flatMap = <T, U>(parser: Parser<T>, f: (value: T, config: Config) => Parser<U>) =>
    qo((perform, config) => perform(f(perform(parser), config)));

const and = <T>(left: Parser<unknown>, right: Parser<T>) =>
    qo(perform => (perform(left), perform(right)));

const skip = <T>(left: Parser<T>, right: Parser<unknown>) =>
    qo(perform => {
        const leftValue = perform(left);
        perform(right);
        return leftValue;
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
                accum.push(perform(parser));
            }
        } catch (err) {
            if (!options?.droppable) throw err;
        }
        return accum;
    });
