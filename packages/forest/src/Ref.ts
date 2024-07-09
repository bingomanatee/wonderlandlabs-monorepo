import { NOT_FOUND } from "./constants";
import { nf } from "./helpers";
import { RefIF } from "./types";
import { RefParams } from "./helpers/paramTypes";

/**
 * a Leaf is an "ANNOTATED VALUE from a tree." it includes its key (id),
 * and the name of the tree it came from. It is a readonly/transient value.
 */
export class Ref implements RefIF {
  constructor(params: RefParams) {
    this.treeName = params.treeName;
    this.key = params.key;
    this.val = nf(params.val);
  }
  readonly val: unknown;
  readonly key: unknown;
  readonly treeName: string;
  get hasValue() {
    return nf(this.val) !== NOT_FOUND;
  }
}
