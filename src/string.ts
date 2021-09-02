import { Parser } from "./parser";
import { failFromSucc, succUpdate } from "./state";

export const regexGroup = (re: RegExp): Parser<RegExpExecArray> => {
    const fixedRegex = new RegExp("^" + re.source, re.flags.replace("g", ""));

    return new Parser(state => {
        if(typeof state.target !== "string") {
            return failFromSucc(state);
        }
        const matchResult = fixedRegex.exec(state.target.substr(state.pos));
        return matchResult === null
            ? failFromSucc(state)
            : succUpdate(state, matchResult, matchResult[0].length);
    });
};
