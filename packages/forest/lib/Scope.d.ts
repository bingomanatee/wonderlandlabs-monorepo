import { Action, Status } from "./helpers/enums";
import { ScopeParams } from "./helpers/paramTypes";
import { ForestIF, ScopeIF } from "./types";
export default class Scope implements ScopeIF {
    constructor(forest: ForestIF, params: ScopeParams);
    readonly id: number;
    readonly scopeID: string;
    readonly name: string | undefined;
    cause: Action;
    status: Status;
    async: boolean;
    inTrees: Set<string>;
    error?: Error;
}
