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
  DataEngineAction,
  DataEngineMap,
  DelVal,
  isMultiDel,
  isSingleDel,
} from "./dataEngineTypes";
import {
  DistMapManifestDel,
  DistMapManifestSet,
  DistributedMap,
} from "./DistributedMap";

function setActionFactory(engine: DataEngineIF): ActionIF {
  const action: DataEngineAction = {
    name: "set",
    cacheable: true,
    delta: function (branch: BranchIF, modifier: KeyVal): unknown {
      return new DistributedMap(branch, { set: modifier });
    },
    map(map: DataEngineMap, target: DistributedMap) {
      const manifest = target.manifest as DistMapManifestSet;
      const { key, val } = manifest.set;
      if (val === DELETED) {
        map.delete(key);
      } else {
        map.set(key, val);
      }
      return map;
    },

    get(searchKey: unknown, target: DistributedMap) {
      const manifest = target.manifest as DistMapManifestSet;
      const { key, val } = manifest.set;
      if (key === searchKey) {
        if (val === DELETED) {
          return undefined;
        }
        return val;
      }
      if (target.prevData) {
        return target.prevData.get(searchKey);
      }
      return undefined;
    }
  };
  return action as ActionIF;
}

function deleteActionFactory(engine: DataEngineIF): ActionIF {
  const action: DataEngineAction = {
    name: "delete",
    cacheable: true,
    delta: function (branch: BranchIF, modifier: DelVal) {
      return new DistributedMap(branch, { del: modifier });
    },
    map(prevMap: DataEngineMap, target: DistributedMap) {
      let map = new Map(prevMap);
      const manifest = target.manifest as DistMapManifestDel;
      const { del } = manifest;
      if (isSingleDel(del)) {
        map.delete(del.delKey);
      } else if (isMultiDel(del)) {
        del.delKeys.forEach((key) => map.delete(key));
      }
      return map;
    },
    get(searchKey: unknown, target: DistributedMap) {
      const manifest = target.manifest as DistMapManifestDel;
      const { del } = manifest;
      if (isSingleDel(del)) {
        if (del.delKey === searchKey) return undefined;
      } else if (isMultiDel(del)) {
        if (del.delKeys.includes(searchKey)) {
          return undefined;
        }
      }
      if (target.prevData) {
        return target.prevData.get(searchKey);
      }
      return undefined;
    }
  };
  return action as ActionIF;
}

function patchEngineFactory(engine: DataEngineIF): ActionIF {
  const action: DataEngineAction = {
    name: 'patch',
    delta(branch, modifier, options) {
      
    },
    map(prevMap: DataEngineMap, target: DistributedMap) {
      const map = new Map(prevMap);
      const manifest = target.manifest as DataEngineMap;
      manifest.forEach((val, key) => {
        if (val === DELETED) {
            map.delete(key);
        } else {
          map.set(key, val);
        }
      });

      return map;
    },
    get(searchKey: unknown, target: DistributedMap) {
      const manifest = target.manifest as DataEngineMap;
      if (manifest.has(searchKey)) {
        const val = manifest.get(searchKey);
        if (val === DELETED) return undefined;
        return val;
      }
      if (target.prevData) {
        return target.prevData.get(searchKey);
      }
      return undefined;
    }

  }

  return action as ActionIF
}

export const dataEngineDistMap = (tree: TreeIF): DataEngineIF => {
  const engine = new DataEngine("distMap");
  engine.addAction(setActionFactory(engine));
  engine.addAction(deleteActionFactory(engine));
  engine.addAction(patchEngineFactory(engine));
  return engine;
};
