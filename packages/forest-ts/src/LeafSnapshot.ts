import { Data, DataID, LeafObj, TreeIF } from "./types";
import { Subscription } from "rxjs";

export default class LeafSnapshot implements LeafObj {
  public $value: Data;

  constructor(
    private $tree: TreeIF,
    public $collection: string,
    public $identity: DataID,
  ) {
    this.$value = $tree.get($collection, $identity)?.value;
  }

  toJSON() {
    return {
      value: this.$value,
      collection: this.$collection,
      identity: this.$identity,
    };
  }

  $subscribe() {
    throw new Error("LeafSnapshot does not imlplement $subscribe");
    return new Subscription();
  }

  public static fromLeafObj(leaf: LeafObj, tree: TreeIF) {
    return new LeafSnapshot(tree, leaf.$collection, leaf.$identity);
  }
}
