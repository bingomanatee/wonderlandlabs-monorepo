import { Branch } from "../../Branch";
import { ACTION_NAME_INITIALIZER } from "../../constants";
import { ActionIF, BranchIF, DataEngineIF, TreeIF } from "../../types";
import { initializer } from "../actions/initializer";
import DataEngine from "./DataEngine";

const replaceAction: ActionIF = {
  name: "set",
  delta(_, val) {
    return val;
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
