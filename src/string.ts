import { Parser } from "./parser";
import { failFrom, succUpdate } from "./state";

export const regexGroup = (re: RegExp): Parser<RegExpExecArray> => {
    const fixedRegex = new RegExp("^" + re.source, re.flags.replace("g", ""));

    return new Parser(state => {
        if(typeof state.target !== "string") {
            return failFrom(state.target, state.pos);
        }
        const matchResult = fixedRegex.exec(state.target.substr(state.pos));
        return matchResult === null
            ? failFrom(state.target, state.pos)
            : succUpdate(state, matchResult, matchResult[0].length);
    });
};
