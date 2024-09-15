import { TreeIF } from "../../types";
import { FieldIF, FieldValue, FieldPairIF, FieldParams } from "./Form.types";
export default class Field implements FieldIF {
    constructor(input: FieldIF);
    tree?: TreeIF;
    name: string;
    value: FieldValue | FieldPairIF;
    params?: Partial<FieldParams>;
    private get defaultParams();
}
