import { pushError } from "./context";
import { Parser } from "./parser";
import { updateState } from "./state";

export interface RegExpGroupArray extends Array<string> {
    groups?: RegExpExecArray["groups"];
}

export const regexGroup = (re: RegExp): Parser<RegExpGroupArray> => {
    const fixedRegex = new RegExp(`^(?:${re.source})`, re.flags.replace("g", ""));

    return new Parser((state, context) => {
        if (typeof context.src !== "string") {
            pushError(context, state.pos);
            return null;
        }
        const matchResult = fixedRegex.exec(context.src.slice(state.pos));
        if (matchResult === null) {
            pushError(context, state.pos);
            return null;
        }
        return updateState(state, matchResult, matchResult[0].length);
    });
};

export const regex: {
    (re: RegExp, groupId?: never): Parser<string>;
    (re: RegExp, groupId: number | string): Parser<string | undefined>;
} = (re, groupId = 0) =>
    regexGroup(re).map(matchResult =>
        typeof groupId === "number"
            ? matchResult[groupId]
            : matchResult.groups?.[groupId]!,
    );
