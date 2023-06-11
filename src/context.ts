import { isArrayLike } from "emnorst";
import type { ParseError } from "./error";

export type Source<T = unknown> =
    | (T extends string ? string : string extends T ? string : never)
    | ArrayLike<T>;

export interface Config {
    readonly [key: string]: unknown;
}

export class Context {
    constructor(readonly src: Source, readonly cfg: Config) {
        if (!isArrayLike(src)) {
            throw new TypeError("source is not ArrayLike.");
        }
    }
    private readonly errs: ParseError[] = [];
    addError(error: ParseError): void {
        this.errs.push(error);
    }
}
