import * as error from "./error";
import { Parser } from "./parser";
import { updateState } from "./state";

export interface RegExpGroupArray extends Array<string> {
    groups?: RegExpExecArray["groups"];
}

export const regexGroup = (re: RegExp): Parser<RegExpGroupArray> => {
    const fixedRegex = new RegExp(`^(?:${re.source})`, re.flags.replace("g", ""));

    return new Parser((state, context) => {
        if (typeof context.src !== "string") {
            context.addError(error.unknown(state.i));
            return null;
        }
        const matchResult = fixedRegex.exec(context.src.slice(state.i));
        if (matchResult === null) {
            context.addError(error.unknown(state.i));
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
