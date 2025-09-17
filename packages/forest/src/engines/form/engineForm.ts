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
import Field from "./Field";
import { Form } from "./Form";
import {
  FieldIF,
  FieldMap,
  FieldPairIF,
  FieldParams,
  FieldValue,
  FormAndFieldsIF,
  FormIF,
  isFieldIF,
  isFieldPairIF,
  isFieldValue,
  isForm,
  isFormAndFieldsIF,
} from "./Form.types";

function isKeyVal(a: unknown): a is KeyVal {
  return isObj(a) && "key" in a && "val" in a;
}

function setActionFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "set",
    cacheable: true,
    mutator(branch: BranchIF, args: MutatorArgs): unknown {
      const tree = branch.tree;
      const [name, val, params] = args as [
        string,
        FieldValue | FieldIF,
        FieldParams?
      ];
      if (!branch.prev) throw new Error("set must have prev");
      const { form, fields } = branch.prev.value as FormAndFieldsIF;
      if (isFieldIF(val)) {
        fields.set(name, val);
      } else if (!fields.has(name)) {
        // generate new field
        if (isFieldPairIF(val) || isFieldValue(val)) {
          fields.set(
            name,
            new Field({ tree: branch.tree, value: val, name, params })
          );
        } else if (isFieldIF(val)) {
          fields.set(name, val);
        } else {
          throw new Error("bad set value");
        }
      } else {
        // mpdify existing field
        const oldField = fields.get(name) as FieldIF;
        const newParams = params || {};
        const mergedParams = oldField.params
          ? { ...oldField.params, ...newParams }
          : { ...newParams };

        fields.set(
          name,
          new Field({ tree, name, value: val, params: mergedParams })
        );
      }

      return {
        form,
        fields: new Map(fields),
      };
    },
  };
  return action as MutatorIF;
}

function deleteActionFactory(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "delete",
    cacheable: true,
    mutator: function (branch: BranchIF, args: MutatorArgs) {
      const fieldNames = args.flat();
      const fields = (branch.value as FormAndFieldsIF).fields;
      const newFields = new Map(fields);
      fieldNames.forEach((name) => {
        // @ts-ignore
        if (newFields.has(name)) {
          // @ts-ignore
          newFields.delete(name);
        }
      });
    },
  };
  return action as MutatorIF;
}

type PropOrObj = string | Partial<FieldParams>;

/**
 * modifies fields with an updated field, with the new props
 * @param fields
 * @param name
 * @param propOrObj
 * @param value
 * @returns
 */
function blendFieldProps(
  fields: FieldMap,
  name: string,
  propOrObj: PropOrObj,
  value?: any
) {
  if (!fields.has(name)) return {};

  if (typeof propOrObj === "string") {
    return blendFieldProps(fields, name, { [propOrObj]: value });
  } else if (isObj(propOrObj)) {
    const field = fields.get(name)!;
    const { params } = field;
    const newParams = params ? { ...params, ...propOrObj } : { ...propOrObj };
    const newField = new Field({
      name,
      value: field.value,
      tree: field.tree,
      params: newParams,
    });
    fields.set(name, newField);
  } else {
    throw new Error("bad argument to blendFieldProps");
  }
}

function updateFieldProps(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "updaeFieldProps",
    mutator(branch: BranchIF, args: MutatorArgs) {
      const [nameOrNames, propOrObj, value] = args;

      if (typeof nameOrNames === "string") {
        return action.mutator(branch, [[nameOrNames], ...args.slice(1)]);
      }

      if (Array.isArray(nameOrNames)) {
        const { fields, form } = branch.value as FormAndFieldsIF;
        for (const name of nameOrNames) {
          if (typeof name !== "string") {
            throw new Error("setFieldProp -- $name must be string or string[]");

            if (fields.has(name)) {
              blendFieldProps(fields, name, propOrObj as PropOrObj, value);
            }
          }
        }

        return { fields: new Map(fields), form };
      }
      throw new Error("cannot update field props");
    },
  };

  return action;
}

function updateForm(engine: EngineIF): MutatorIF {
  const action: MutatorIF = {
    name: "updateForm",
    mutator(branch: BranchIF, args: MutatorArgs) {
      const [propOrObj, value] = args;
      const { fields, form } = branch.value as FormAndFieldsIF;

      if (typeof propOrObj === "string") {
        const newForm = new Form({ ...form, [propOrObj]: value });
        return { form: newForm, fields };
      } else if (isObj(propOrObj)) {
        const newForm = new Form({ ...form, ...propOrObj });
        return { form: newForm, fields };
      } else {
        throw new Error("bad format for updateForm");
      }
    },
  };

  return action;
}

export const engineForm = {
  name: "form",
  factory(tree: TreeIF): EngineIF {
    const engine = new DataEngine("map", {
      cacheable: CACHE_TOP_ONLY,
      validator(value: unknown) {
        if (!isFormAndFieldsIF(value)) {
          throw new Error("form engine requires form and fields");
        }
      },
    });
    engine.addAction(setActionFactory(engine));
    engine.addAction(deleteActionFactory(engine));
    engine.addAction(updateFieldProps(engine));
    engine.addAction(updateForm(engine));
    return engine;
  },
};
