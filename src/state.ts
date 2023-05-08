export type ParseState<out T> = {
    readonly i: number;
    readonly v: T;
};

export const initState: ParseState<null> = {
    i: 0,
    v: null,
};

export const updateState = <T>(
    state: ParseState<unknown>,
    value: T,
    consumeLength: number,
): ParseState<T> => ({
    i: state.i + consumeLength,
    v: value,
});
