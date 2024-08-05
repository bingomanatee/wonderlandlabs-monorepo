import { GenObj, isObj, TreeIF } from "../../types";
import { GenericMap } from "../engineTypes";
import {
  FieldIF,
  FieldValue,
  FieldPairIF,
  FieldParams,
  FieldInfo,
} from "./Form.types";

export default class Field implements FieldIF {
  constructor(input: FieldIF) {
    this.tree = input.tree;
    this.name = input.name;
    this.value = input.value;

    this.params = [this.defaultParams, input.params].reduce(
      (out: GenObj, input) => {
        if (isObj(input)) {
          return { ...out, ...input };
        }
        return out;
      },
      {}
    );
  }

  tree?: TreeIF;
  name: string;
  value: FieldValue | FieldPairIF;
  params?: Partial<FieldParams>;

  private get defaultParams(): FieldParams | undefined {
    let defaultParams: unknown;
    let fields = this.tree?.engineInput
      ? (this.tree.engineInput as GenObj).fields
      : undefined;
    if (fields) {
      if ((fields as GenericMap).has(name)) {
        defaultParams = ((fields as GenericMap).get(name) as FieldInfo).params;
      }
    }
    return undefined;
  }
}
