import type {
    LeafIF, TreeIF, ForestIF,
    TreeName, ChangeBase, Data, BranchIF,
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
            forest, treeName, data
        } = params;
        this.forest = forest;
        this.name = treeName;
        if (data) this.root = new Branch(this, { data, cause: BranchActionEnum.init });
    }
    get size() {
        let keys = new Set();
        let branch = this.root;

        while(branch) {
            branch.data.forEach((_, k) => keys.add(k));
            branch = branch.next;
        }
        return keys.size;
    }
    
    values(): Map<unknown, unknown> {
        if (!this.root) return new Map();
        return this.root.values();
    }

    clearValues() {
        const removed = this.branches;
        this.root = undefined;
        return removed;
    }

    
    get branches() {
        const out = [];
        let current = this.root;
        while (current) {
            out.push(current);
            current = current.next;
        }
        return out;
    };

    public forest: ForestIF;
    name: TreeName;
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

    leaf(key: unknown): LeafIF {
        if (!this.root) {
            return new Leaf({ treeName: this.name, key, val: NOT_FOUND });
        }
        return this.root.leaf(key);
    }

    get(key: unknown): unknown {
        if (!this.root) {
            return undefined;
        }
        return this.top?.get(key);
    }

    has(key: unknown): boolean {
        if (!this.root) return false;
        return !!this.top?.has(key);
    }

    private addBranch(key: unknown, val: unknown, cause: BranchAction) {
        const next = new Branch(this, { data: mp(key, val), cause: BranchActionEnum.set });
        if (this.top) {
            next.prev = this.top;
            return this.top.next = next;
        } else {
            this.root = new Branch(this, { data: mp(key, val), cause: BranchActionEnum.set });
        }
        return next;
    }

    set(key: unknown, val: unknown): unknown {
        this.addBranch(key, val, BranchActionEnum.set)
        return this.top!.get(key);
    }

    del(key: unknown) {
        this.addBranch(key, DELETED, BranchActionEnum.del);
        return this.top!.get(key);
    }

    get status() {
        return StatusEnum.good;
    }

    change(c: ChangeBase): ChangeResponse {
        if (isTreeSet(c)) {
            this.set(c.key, c.val);
            return { treeName: this.name, change: c, status: this.status };
        } else if (isTreeDel(c)) {
            //@ts-ignore
            this.del(c.key);
        } else {
            //@TODO: more change types
            throw new Error('not implemented')
        }
        return { treeName: this.name, change: c, status: this.status };
    }

}
