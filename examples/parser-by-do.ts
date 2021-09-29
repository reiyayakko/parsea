import { Parser, qo } from "../src";

const pure = <T>(val: T) => qo(() => val);

const map = <T, U>(parser: Parser<T>, f: (v: T) => U) =>
    qo(perform => f(perform(parser)));

const flatMap = <T, U>(parser: Parser<T>, f: (v: T) => Parser<U>) =>
    qo(perform => perform(f(perform(parser))));

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
