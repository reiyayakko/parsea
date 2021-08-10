export type Target<T = unknown> =
    | (T extends string ? string : string extends T ? string : never)
    | ArrayLike<T>;

export type ParseState<T> = Success<T> | Failure;

// INFO: Success State

export interface Success<T> {
    readonly succ: true;
    readonly target: Target;
    readonly pos: number;
    readonly value: T;
}

export const succInit = (target: Target): Success<null> => ({
    succ: true,
    target,
    pos: 0,
    value: null,
});

export const succUpdate = <T>(
    succ: Success<unknown>,
    value: T,
    consumeLength: number,
): Success<T> => ({
    succ: true,
    target: succ.target,
    pos: succ.pos + consumeLength,
    value,
});

// INFO: Failure State

export interface Failure {
    readonly succ: false;
    readonly target: Target;
    readonly pos: number;
}

export const failFromSucc = (succ: Success<unknown>): Failure => ({
    succ: false,
    target: succ.target,
    pos: succ.pos,
});

export const margeFail = (failA: Failure, failB: Failure): Failure => {
    if(failA.target !== failB.target) {
        throw new Error("`Failure` with different targets cannot be merged.");
    }

    if(failA.pos < failB.pos) return failA;
    if(failA.pos > failB.pos) return failB;
    return {
        succ: false,
        target: failA.target,
        pos: failA.pos,
    };
};
