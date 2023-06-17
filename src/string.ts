import * as error from "./error";
import { Parser } from "./parser";
import { updateState } from "./state";

export const string = <const T extends string>(string: T): Parser<T> => {
    return new Parser((state, context) => {
        if (typeof context.src !== "string") {
            context.addError(state.i);
            return null;
        }
        if (state.i + string.length > context.src.length) {
            context.addError(state.i, error.expected(string));
            return null;
        }
        const slice = context.src.slice(state.i, state.i + string.length);
        if (slice !== string) {
            context.addError(state.i, error.expected(string));
            return null;
        }
        return updateState(state, string, string.length);
    });
};

export const CODE_POINT = /* @__PURE__ */ new Parser((state, context) => {
    if (typeof context.src !== "string") {
        context.addError(state.i);
        return null;
    }
    if (state.i + 1 > context.src.length) {
        context.addError(state.i);
        return null;
    }
    const first = context.src.charCodeAt(state.i);
    // high surrogate
    if (0xd800 <= first && first < 0xdc00) {
        if (state.i + 2 > context.src.length) {
            context.addError(state.i);
            return null;
        }
        const second = context.src.charCodeAt(state.i + 1);
        // low surrogate
        if (0xdc00 <= second && second < 0xe000) {
            return updateState(state, context.src.slice(state.i, state.i + 2), 2);
        }
        context.addError(state.i);
        return null;
    }
    // low surrogate
    if (0xdc00 <= first && first < 0xe000) {
        context.addError(state.i);
        return null;
    }
    return updateState(state, context.src[state.i], 1);
});

export const regexGroup = (re: RegExp): Parser<RegExpExecArray> => {
    const fixedRegex = new RegExp(`^(?:${re.source})`, re.flags.replace("g", ""));

    return new Parser((state, context) => {
        if (typeof context.src !== "string") {
            context.addError(state.i);
            return null;
        }
        const matchResult = fixedRegex.exec(context.src.slice(state.i));
        if (matchResult === null) {
            context.addError(state.i);
            return null;
        }
        return updateState(state, matchResult, matchResult[0].length);
    });
};

export const regex: {
    (re: RegExp): Parser<string>;
    (re: RegExp, groupId: number | string): Parser<string | undefined>;
    <T>(re: RegExp, groupId: number | string, defaultValue: T): Parser<string | T>;
} = (re: RegExp, groupId: number | string = 0, defaultValue?: undefined) =>
    regexGroup(re).map(
        matchResult =>
            (typeof groupId === "number"
                ? matchResult[groupId]
                : matchResult.groups?.[groupId]!) ?? defaultValue,
    );
