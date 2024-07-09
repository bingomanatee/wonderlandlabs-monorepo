import { Branch } from "../Branch";
import { ACTION_NAME_INITIALIZER } from "../constants";
import { ActionIF, BranchIF, DataEngineIF, TreeIF } from "../types";
import { initializer } from "./actions/initializer";

const replaceAction: ActionIF = {
  name: "replace",
  delta(_, val) {
    return val;
  },
};

export const dataEngineSeq: DataEngineIF = {
  name: "sequential",
  actions: new Map([
    [ACTION_NAME_INITIALIZER, initializer],
    ["replace", replaceAction],
  ]),
};
