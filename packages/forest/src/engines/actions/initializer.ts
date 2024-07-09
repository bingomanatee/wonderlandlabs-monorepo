import { Branch } from "../../Branch";
import { ACTION_NAME_INITIALIZER } from "../../constants";
import { TreeIF, TreeSeed } from "../../types";

/**
 * a generic initializer; it returns a seed's initial value. 
 * Some intitializers may validate their data. 
 */
export const initializer = {
  name: ACTION_NAME_INITIALIZER,
  generator(tree: TreeIF, seed: TreeSeed) {
    if (!("initialValue" in seed))
      throw new Error("dataEngineScalar requires initialValue in seed");

    return new Branch(tree, initializer, seed.initialValue);
  },
  delta(_, data: unknown) {
    return data;
  },
};
