export type Source<T = unknown> =
    | (T extends string ? string : string extends T ? string : never)
    | ArrayLike<T>;

export interface Config {
    readonly [key: string]: unknown;
}

export type ParseState<T> = Success<T> | Failure;

// INFO: Success State

export interface Success<T> {
    readonly succ: true;
    readonly config: Config;
    readonly src: Source;
    readonly pos: number;
    readonly val: T;
}

export const succInit = (src: Source, config: Config): Success<null> =>
    ({ succ: true, config, src, pos: 0, val: null });

export const succUpdate = <T>(
    succ: Success<unknown>,
    value: T,
    consumeLength: number,
): Success<T> => ({
    succ: true,
    config: succ.config,
    src: succ.src,
    pos: succ.pos + consumeLength,
    val: value,
});

// INFO: Failure State

export interface Failure {
    readonly succ: false;
    readonly src: Source;
    readonly pos: number;
}

export const failFrom = (src: Source, pos: number): Failure => ({ succ: false, src, pos });

export const margeFail = (failA: Failure, failB: Failure): Failure => {
    if(failA.src !== failB.src) {
        throw new Error("`Failure` with different sources cannot be merged.");
    }

    if(failA.pos < failB.pos) return failA;
    if(failA.pos > failB.pos) return failB;
    return {
        succ: false,
        src: failA.src,
        pos: failA.pos,
    };
};
