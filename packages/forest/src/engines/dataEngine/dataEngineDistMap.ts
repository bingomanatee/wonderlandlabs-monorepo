import { DELETED } from "../../constants";
import {
  ActionIF,
  BranchIF,
  DataEngineIF,
  GenObj,
  KeyVal,
  TreeIF,
} from "../../types";
import DataEngine from "./DataEngine";
import {
  DataEngineMap,
  DelVal,
  isMultiDel,
  isSingleDel,
} from "./dataEngineTypes";

function setActionFactory(engine: DataEngineIF): ActionIF {
  const action: ActionIF = {
    name: "set",
    cacheable: true,
    delta: function (branch: BranchIF, manifest: KeyVal): unknown {
      const map = branch.prev
        ? new Map(branch.prev!.value as DataEngineMap)
        : new Map();
      const { key, val } = manifest;
      if (val === DELETED) {
        map.delete(key);
      } else {
        map.set(key, val);
      }
      return map;
    },
  };
  return action as ActionIF;
}

function deleteActionFactory(engine: DataEngineIF): ActionIF {
  const action: ActionIF = {
    name: "delete",
    cacheable: true,
    delta: function (branch: BranchIF, del: DelVal) {
      const map = branch.prev
        ? new Map(branch.prev!.value as DataEngineMap)
        : new Map();

      if (isSingleDel(del)) {
        map.delete(del.delKey);
      } else if (isMultiDel(del)) {
        del.delKeys.forEach((key) => map.delete(key));
      }
      return map;
    },
  };
  return action as ActionIF;
}

function patchEngineFactory(engine: DataEngineIF): ActionIF {
  const action: ActionIF = {
    name: "patch",
    cacheable: true,
    delta(branch, modifier, options) {
      const map = branch.prev
        ? new Map(branch.prev!.value as DataEngineMap)
        : new Map();
      const manifest = modifier as DataEngineMap;
      manifest.forEach((val, key) => {
        if (val === DELETED) {
          map.delete(key);
        } else {
          map.set(key, val);
        }
      });

      return map;
    },
  };

  return action;
}
function replaceActionFactory(engine: DataEngineIF): ActionIF {
  const action: ActionIF = {
    name: "replace",
    cacheable: true,
    delta(
      branch,
      modifier: DataEngineMap | Iterable<[unknown, unknown]>,
      options
    ) {
      return new Map(modifier);
    },
  };

  return action;
}

export const dataEngineDistMap = {
  name: "distMap",
  factory(tree: TreeIF): DataEngineIF {
    const engine = new DataEngine("distMap");
    engine.addAction(setActionFactory(engine));
    engine.addAction(deleteActionFactory(engine));
    engine.addAction(patchEngineFactory(engine));
    engine.addAction(replaceActionFactory(engine));
    return engine;
  },
};
