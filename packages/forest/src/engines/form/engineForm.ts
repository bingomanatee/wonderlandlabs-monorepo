import { CACHE_TOP_ONLY, DELETED } from "../../constants";
import {
  MutatorArgs,
  MutatorIF,
  BranchIF,
  EngineIF,
  isObj,
  KeyVal,
  TreeIF,
} from "../../types";
import { ValidatorError } from "../../ValidatorError";
import DataEngine from "../Engine";
import {
  GenericMap,
  DelVal,
  isDel,
  isMultiDel,
  isSingleDel,
} from "../engineTypes";
import { Form } from "./Form";
import from "./Form.types";
import Field from "./Field";

function isKeyVal(a: unknown): a is KeyVal {
  return isObj(a) && "key" in a && "val" in a;
}

function setActionFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "set",
    cacheable: true,
    mutator(branch: BranchIF, args: MutatorArgs): unknown {
      const [name, val, params] = args as [
        string,
        FieldValue | FieldPairIF | FieldIF,
        FieldParams?
      ];
      if (!branch.prev) throw new Error("set must have prev");
      const form: FormDefIF = new Form(branch.prev.value as Partial<FormDefIF>)
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

        form.set(name, val, params);
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
    mutator: function (branch: BranchIF, keys: MutatorArgs) {},
  };
  return action as MutatorIF;
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
    return engine;
  },
};
