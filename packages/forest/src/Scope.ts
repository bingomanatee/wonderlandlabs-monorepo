import { BranchAction, BranchActionEnum, Status, StatusEnum } from "./helpers/enums";
import { ScopeParams } from "./helpers/paramTypes";
import { ForestIF, ScopeIF } from "./types";

export default class Scope implements ScopeIF {
    constructor(forest: ForestIF, params: ScopeParams) {
        const { cause, name, status } = params;
        this.name = name || 'transaction';
        this.id = forest.nextBranchId();
        this.scopeID = `${this.name}-${this.id}`
        this.cause = cause || BranchActionEnum.trans;
        this.status = status || StatusEnum.pending;
        this.async = false;
    }
    readonly id: number;
    readonly scopeID: string;
    readonly name: string | undefined;
    cause: BranchAction;
    status: Status;
    async: boolean;
    inTrees: Set<string> = new Set();
    error?: Error;
}