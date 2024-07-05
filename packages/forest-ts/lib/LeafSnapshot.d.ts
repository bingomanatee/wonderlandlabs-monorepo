import { Data, DataID, LeafObj, TreeIF } from "./types";
import { Subscription } from "rxjs";
export default class LeafSnapshot implements LeafObj {
  private $tree;
  $collection: string;
  $identity: DataID;
  $value: Data;
  constructor($tree: TreeIF, $collection: string, $identity: DataID);
  toJSON(): {
    value: Data;
    collection: string;
    identity: DataID;
  };
  $subscribe(): Subscription;
  static fromLeafObj(leaf: LeafObj, tree: TreeIF): LeafSnapshot;
}
