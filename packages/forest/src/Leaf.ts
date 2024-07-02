import { NOT_FOUND } from "./constants";
import { nf } from "./helpers";
import { LeafIF, LeafParams } from "./types";

export class Leaf implements LeafIF {
    constructor(params: LeafParams) {
        this.treeName = params.treeName;
        this.key = params.key;
        this.val = nf(params.val);
    }
    readonly val: unknown;
    readonly key: unknown;
    readonly treeName: string;
    get hasValue() {
        return nf(this.val) !== NOT_FOUND;
    };
}