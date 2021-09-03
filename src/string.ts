import { Parser } from "./parser";
import { failFrom, succUpdate } from "./state";

export const regexGroup = (re: RegExp): Parser<RegExpExecArray> => {
    const fixedRegex = new RegExp("^" + re.source, re.flags.replace("g", ""));

    return new Parser(state => {
        if(typeof state.src !== "string") {
            return failFrom(state.src, state.pos);
        }
        const matchResult = fixedRegex.exec(state.src.substr(state.pos));
        return matchResult === null
            ? failFrom(state.src, state.pos)
            : succUpdate(state, matchResult, matchResult[0].length);
    });
};
