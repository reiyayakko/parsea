export type Target<T = unknown> =
    | (T extends string ? string : string extends T ? string : never)
    | ArrayLike<T>;

export type ParseState<R> = Success<R> | Failure;

// INFO: Success State

export interface Success<R> {
    readonly succ: true;
    readonly target: Target;
    readonly pos: number;
    readonly value: R;
}

export const succInit = (target: Target): Success<null> => ({
    succ: true,
    target,
    pos: 0,
    value: null,
});

export const succUpdate = <R>(
    succ: Success<unknown>,
    value: R,
    consumeLength: number,
): Success<R> => ({
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
