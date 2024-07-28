import { CACHE_TOP_ONLY, DELETED } from "../constants";
import {
  MutatorArgs,
  MutatorIF,
  BranchIF,
  EngineIF,
  GenObj,
  isObj,
  KeyVal,
  TreeIF,
} from "../types";
import { ValidatorError } from "../ValidatorError";
import DataEngine from "./Engine";
import {
  GenericMap,
  DelVal,
  isDel,
  isMultiDel,
  isSingleDel,
} from "./engineTypes";
import Field, {
  FieldIF,
  FieldPairIF,
  FieldParams,
  FieldValue,
  FormIF,
  isFieldIF,
  isFieldPairIF,
  isFieldValue,
  isForm,
} from "./Form.types";

function isKeyVal(a: unknown): a is KeyVal {
  return isObj(a) && "key" in a && "val" in a;
}

function setActionFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "set",
    cacheable: true,
    mutator: function (branch: BranchIF, args: MutatorArgs): unknown {
      const [name, val, params] = args as [
        string,
        FieldValue | FieldPairIF | FieldIF,
        FieldParams?
      ];
      if (!branch.prev) throw new Error("set must have prev");
      const form = branch.prev.value as FormIF;
      if (!form.fields.has(name)) {
        // generate new field
        if (isFieldPairIF(val) || isFieldValue(val)) {
          form.fields.set(
            name,
            new Field({ tree: branch.tree, value: val, name, params })
          );
        } else if (isFieldIF(val)) {
          form.fields.set(name, val);
        } else {
          throw new Error("bad set value");
        }
      } else {
        // mpdify existing field
        const oldField = form.fields.get(name) as FieldIF;
        const newField = new Field(oldField);

        if (isFieldPairIF(val) || isFieldValue(val)) {
          newField.value = val;
          form.fields.set(name, newField);
        } else {
          throw new Error("bad set value");
        }

        if (params) {
          if (newField.params) {
            newField.params = { ...newField.params, params };
          } else {
            newField.params = params;
          }
        }
      }

      form.fields = new Map(form.fields);

      return form;
    },
  };
  return action as MutatorIF;
}

function deleteActionFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "delete",
    cacheable: true,
    mutator: function (branch: BranchIF, keys: MutatorArgs) {
      const map = branch.prev
        ? new Map(branch.prev!.value as GenericMap)
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
  return action as MutatorIF;
}

function patchEngineFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "patch",
    cacheable: true,
    mutator(branch, args: MutatorArgs) {
      const map = branch.prev
        ? new Map(branch.prev!.value as GenericMap)
        : new Map();

      const [manifest] = args;

      if (!(Array.isArray(manifest) || manifest instanceof Map)) {
        throw new Error("bad patch argument");
      }

      const next = Array.isArray(manifest) ? new Map(manifest) : manifest;
      (next as GenericMap).forEach((val, key) => {
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
function replaceActionFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "replace",
    cacheable: true,
    mutator(branch, args: MutatorArgs) {
      const [seed] = args;
      return new Map(seed as GenericMap | Iterable<[unknown, unknown]>);
    },
  };

  return action;
}

export const engineMap = {
  name: "map",
  factory(tree: TreeIF): EngineIF {
    const engine = new DataEngine("map", {
      cacheable: CACHE_TOP_ONLY,
      validator(value: unknown) {
        if (!isForm(value)) {
          throw new Error("badly formed form");
        }
        return false;
      },
    });
    engine.addAction(setActionFactory(engine));
    engine.addAction(deleteActionFactory(engine));
    engine.addAction(patchEngineFactory(engine));
    engine.addAction(replaceActionFactory(engine));
    return engine;
  },
};
