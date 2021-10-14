import { Parser } from "./parser";
import { failFrom, succUpdate } from "./state";

export interface RegExpGroupArray extends Array<string> {
    groups?: RegExpExecArray["groups"];
}

export const regexGroup = (re: RegExp): Parser<RegExpGroupArray> => {
    const fixedRegex = new RegExp("^" + re.source, re.flags.replace("g", ""));

    return new Parser((state, context) => {
        if (typeof context.src !== "string") {
            return failFrom(context, state.pos);
        }
        const matchResult = fixedRegex.exec(context.src.substr(state.pos));
        return matchResult === null
            ? failFrom(context, state.pos)
            : succUpdate(state, matchResult, matchResult[0].length);
    });
};

export const regex: {
    (re: RegExp, groupId?: never): Parser<string>;
    (re: RegExp, groupId: number | string): Parser<string | undefined>;
} = (re: RegExp, groupId = 0): Parser<string> =>
    regexGroup(re).map(matchResult =>
        typeof groupId === "number"
            ? matchResult[groupId]
            : matchResult.groups?.[groupId],
    ) as Parser<string>;
