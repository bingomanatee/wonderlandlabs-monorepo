import { Action, Action_s, Status, Status_s } from "./helpers/enums";
import { ScopeParams } from "./helpers/paramTypes";
import { ForestIF, ScopeIF } from "./types";

export default class Scope implements ScopeIF {
  constructor(forest: ForestIF, params: ScopeParams) {
    const { cause, name, status } = params;
    this.name = name || "transaction";
    this.id = forest.nextBranchId();
    this.scopeID = params.scopeID || `${this.name}-${this.id}`;
    // @TODO: validate for uniquenes; possibly user provided scopeID is not a great idea...
    this.cause = cause || Action_s.trans;
    this.status = status || Status_s.pending;
    this.async = false;
  }
  readonly id: number;
  readonly scopeID: string;
  readonly name: string | undefined;
  cause: Action;
  status: Status;
  async: boolean;
  inTrees: Set<string> = new Set();
  error?: Error;
}
