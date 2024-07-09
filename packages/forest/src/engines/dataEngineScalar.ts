import { ACTION_NAME_INITIALIZER } from "../constants";
import {
  ActionIF,
  BranchIF,
  DataEngineIF,
  DataEngineName,
  TreeIF,
} from "../types";
import { initializer } from "./initializer";

const replaceAction: ActionIF = {
  name: "replace",
  generator(tree: TreeIF, value: unknown) {
    return new Branch(tree, replaceAction, value);
  },
};

export const dataEngineScalar: DataEngineIF = {
  name: "scalar data",
  actions: new Map([
    [ACTION_NAME_INITIALIZER, initializer],
    ["replace", replaceAction],
  ]),
};
