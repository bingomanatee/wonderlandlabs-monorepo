import type {
    LeafIF, TreeIF, ForestIF,
    TreeName, ChangeBase, Base, BranchIF,
    ChangeResponse
} from "./types";
import { BranchAction, BranchActionEnum, StatusEnum } from "./enums";
import { Branch } from "./Branch";
import { Leaf } from "./Leaf";
import { mp } from "./helpers";
import { isTreeSet } from "./helpers/isTreeSet";
import { isTreeDel } from "./helpers/isTreeDel";
import { DELETED, NOT_FOUND } from "./constants";

type TreeParams = {
    treeName: TreeName,
    forest: ForestIF,
    data?: Map<unknown, unknown>
}
/**
 * Tree is a "table" of records; a key/value store. 
 */
export class Tree implements TreeIF {
    constructor(params: TreeParams) {
        const {
             forest,  treeName, data
        } = params;
        this.forest = forest;
        this.treeName = treeName;
        if (data) this.root = new Branch(this, { data, cause: BranchActionEnum.init });
    }

    public forest: ForestIF;
    treeName: TreeName;
    root: BranchIF | undefined;
    get top() {
        if (!this.root) return undefined;
        let b = this.root;
        while (b) {
            if (!b.next) return b;
            b = b.next;
        }
        return b;
    }
    get(key: unknown): LeafIF {
        if (!this.root) {
            return new Leaf({ treeName: this.treeName, key, val: NOT_FOUND });
        }
        return this.root.get(key);
    }
    has(key: unknown): boolean {
        if (!this.root) return false;
        return !!this.top?.has(key);
    }

    private push(key: unknown, val: unknown, cause: BranchAction) {
        if (this.root) {
            return this.root.set(key, val)
        }
        this.root = new Branch(this, { data: mp(key, val), cause: BranchActionEnum.set });
    }
    set(key: unknown, val: unknown): LeafIF {
        this.push(key, val, BranchActionEnum.set)
        return this.top!.get(key);
    }

    del(key: unknown) {
        this.push(key, DELETED, BranchActionEnum.del);
        return this.top!.get(key);
    }

    get status() {
        return StatusEnum.good;
    }

    async: boolean = false;
    change(c: ChangeBase): ChangeResponse {
        if (isTreeSet(c)) {
            this.set(c.key, c.val);
            return { treeName: this.treeName, change: c, status: this.status };
        }
        if (isTreeDel(c)) {
            //@ts-ignore
            this.del(c.key);
            return { treeName: this.treeName, change: c, status: this.status };
        }
        //@TODO: more change types
        throw new Error('not implemented')
    }

}
