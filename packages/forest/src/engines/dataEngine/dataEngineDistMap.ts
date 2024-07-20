import { DELETED } from "../../constants";
import {
  ActionDeltaArgs,
  ActionIF,
  BranchIF,
  DataEngineIF,
  GenObj,
  isObj,
  KeyVal,
  TreeIF,
} from "../../types";
import DataEngine from "./DataEngine";
import {
  DataEngineMap,
  DelVal,
  isDel,
  isMultiDel,
  isSingleDel,
} from "./dataEngineTypes";

function isKeyVal(a: unknown): a is KeyVal {
  return isObj(a) && "key" in a && "val" in a;
}

function setActionFactory(engine: DataEngineIF): ActionIF {
  const action: ActionIF = {
    name: "set",
    cacheable: true,
    delta: function (branch: BranchIF, args: ActionDeltaArgs): unknown {
      const map = branch.prev
        ? new Map(branch.prev!.value as DataEngineMap)
        : new Map();
      const [a, b] = args;
      if (args.length == 1 && isKeyVal(a)) {
        const { key, val } = a;
        if (val === DELETED) {
          map.delete(key);
        } else {
          map.set(key, val);
        }
      } else {
        if (b === DELETED) {
          map.delete(a);
        } else {
          map.set(a, b);
        }
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
    delta: function (branch: BranchIF, keys: ActionDeltaArgs) {
      const map = branch.prev
        ? new Map(branch.prev!.value as DataEngineMap)
        : new Map();
      const [first] = keys;
      if (isDel(first)) {
        if (isSingleDel(first)) {
          map.delete(first.delKey);
        }
        if (isMultiDel(first)) {
          for (const key of first.delKeys) {
            map.delete(key);
          }
        }
      } else {
        for (const key of keys) {
          map.delete(key);
        }
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
    delta(branch, args: ActionDeltaArgs) {
      const map = branch.prev
        ? new Map(branch.prev!.value as DataEngineMap)
        : new Map();

      const [manifest] = args;
      (manifest as DataEngineMap).forEach((val, key) => {
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
    delta(branch, args: ActionDeltaArgs) {
      const [seed] = args;
      return new Map(seed as DataEngineMap | Iterable<[unknown, unknown]>);
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
