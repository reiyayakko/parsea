import { qo, type Config, type Parser } from "../src";

// For simplicity, the behavior may differ in a few cases.

const pure = <T>(value: T) => qo(() => value);

const map = <T, U>(parser: Parser<T>, f: (value: T, config: Config) => U) =>
    qo((perform, config) => f(perform(parser), config));

const flatMap = <T, U>(parser: Parser<T>, f: (value: T, config: Config) => Parser<U>) =>
    qo((perform, config) => perform(f(perform(parser), config)));

const and = <T>(left: Parser, right: Parser<T>) =>
    qo(perform => (perform(left), perform(right)));

const skip = <T>(left: Parser<T>, right: Parser) =>
    qo(perform => {
        const leftValue = perform(left);
        perform(right);
        return leftValue;
    });

const between = <T>(parser: Parser<T>, pre: Parser, post = pre): Parser<T> =>
    qo(perform => {
        perform(pre);
        const value = perform(parser);
        perform(post);
        return value;
    });

const or = <T, U>(left: Parser<T>, right: Parser<U>) =>
    qo(perform => {
        const leftResult = perform.try(() => ({
            value: perform(left),
        }));
        return leftResult ? leftResult.value : perform(right);
    });

const option = <T, U>(parser: Parser<T>, value: U) =>
    qo(perform => {
        const result = perform.try(() => ({
            value: perform(parser),
        }));
        return result ? result.value : value;
    });

const seq = <T>(
    parsers: readonly Parser<T>[],
    options?: { allowPartial?: boolean },
): Parser<T[]> =>
    qo(perform => {
        const accum: T[] = [];
        const fullSeq = () => {
            for (const parser of parsers) {
                accum.push(perform(parser));
            }
        };
        if (options?.allowPartial) {
            perform.try(fullSeq, true);
        } else {
            fullSeq();
        }
        return accum;
    });

const many = <T>(parser: Parser<T>): Parser<T[]> =>
    qo(perform => {
        const xs: T[] = [];
        perform.try(() => {
            for (;;) xs.push(perform(parser));
        }, true);
        return xs;
    });
