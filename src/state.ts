import type { Context } from "./context";

export type ParseState<T> = Success<T> | Failure;

// INFO: Success State

export interface Success<T> {
    readonly succ: true;
    readonly pos: number;
    readonly val: T;
}

export const succInit: Success<null> = {
    succ: true,
    pos: 0,
    val: null,
};

export const updateSucc = <T>(
    succ: Success<unknown>,
    value: T,
    consumeLength: number,
): Success<T> => ({
    succ: true,
    pos: succ.pos + consumeLength,
    val: value,
});

// INFO: Failure State

export interface Failure {
    readonly succ: false;
    readonly ctx: Context;
    readonly pos: number;
}

export const failFrom = (ctx: Context, pos: number): Failure => ({
    succ: false,
    ctx,
    pos,
});

export const margeFail = (failA: Failure, failB: Failure): Failure => {
    if (failA.ctx !== failB.ctx) {
        throw new Error("`Failure` with different contexts cannot be merged.");
    }

    if (failA.pos < failB.pos) return failA;
    if (failA.pos > failB.pos) return failB;
    return {
        succ: false,
        ctx: failA.ctx,
        pos: failA.pos,
    };
};
