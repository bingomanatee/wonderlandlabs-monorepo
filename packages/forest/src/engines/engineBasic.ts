import { Branch } from "../Branch";
import { ACTION_NAME_INITIALIZER } from "../constants";
import { MutatorArgs, MutatorIF, BranchIF, EngineIF, TreeIF } from "../types";
import { initializer } from "./actions/initializer";
import DataEngine from "./Engine";

const replaceAction: MutatorIF = {
  name: "set",
  mutator(_, val: MutatorArgs) {
    return val[0];
  },
};

export const dataEngineBasic = {
  name: "basic",
  factory() {
    const engine = new DataEngine("basic");
    engine.addAction(replaceAction);
    return engine;
  },
};
