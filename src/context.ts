export type Source<T = unknown> =
    | (T extends string ? string : string extends T ? string : never)
    | ArrayLike<T>;

export interface Config {
    readonly [key: string]: unknown;
}

export interface Context {
    readonly cfg: Config;
    readonly src: Source;
    readonly errs: ParseError[];
}

export interface ParseError {
    pos: number;
}

export const pushError = (context: Context, pos: number) => {
    context.errs.push({ pos });
};
