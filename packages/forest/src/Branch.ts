import type {
    LeafIF, TreeIF, ChangeBase, BranchIF,
    ChangeResponse
} from "./types";
import type { BranchConfig } from "./helpers/paramTypes";

import type { Status, BranchAction } from "./enums";
import { StatusEnum, BranchActionEnum, ChangeTypeEnum } from "./enums";
import { Leaf } from './Leaf';
import { mp } from "./helpers";
import { DELETED, NOT_FOUND } from "./constants";
import { isTreeSet } from "./helpers/isTreeSet";
import { isTreeDel } from "./helpers/isTreeDel";

export class Branch implements BranchIF {
    constructor(public tree: TreeIF, config: BranchConfig) {
        this.cause = config.cause;
        this.status = StatusEnum.good;
        this.data = this._initData(config);
        if (config.prev) this.prev = config.prev;
        this.id = tree.forest.nextBranchId();
        //@TODO: validate.
    }

    readonly id: number;

    values(list?: Map<unknown, unknown> | undefined): Map<unknown, unknown> {
        if (!list) {
            list = new Map(this.data);
        } else {
            this.data.forEach((value, key) => {
                list!.set(key, value);
            });
        }
        if (this.next) {
            return this.next.values(list);
        }
        return list;

    }


    private _initData(config: BranchConfig) {
        if (config.data) {
            return config.data;
        }
        return new Map();
    }

    public data: Map<unknown, unknown>;

    cause: BranchAction;
    status: Status;
    next?: BranchIF | undefined;
    prev?: BranchIF | undefined;
    leaf(key: unknown): LeafIF {
        if (this.data.has(key)) {
            return this.leafFactory(key, this.data.get(key));
        }
        if (this.prev) {
            return this.prev.leaf(key);
        }
        return this.leafFactory(key, NOT_FOUND);
    }
    get(key: unknown): unknown {
        if (this.data.has(key)) {
            return this.data.get(key);
        }
        if (this.prev) {
            return this.prev.get(key);
        }
        return undefined;
    }

    private leafFactory(k: unknown, v?: unknown) {
        return new Leaf(
            {
                treeName: this.tree.name,
                key: k,
                val: v,
                forest: this.tree.forest
            });
    }

    private addBranch(key: unknown, val: unknown, cause: BranchAction): BranchIF {
        if (this.next) {
            throw new Error('cannot push on a non-terminal branch');
        }
        const next = new Branch(this.tree, {
            prev: this,
            data: mp(key, val),
            cause: cause
        })
        this.next = next;
        return next;
    }

    has(key: unknown): boolean {
        if (this.data.has(key)) return true;
        if (this.prev) return this.prev.has(key);
        return false;
    }
    set(key: unknown, val: unknown): unknown {
        if (this.next) return this.next.set(key, val);
        this.addBranch(key, val, BranchActionEnum.set);
        //@TODO: validate
        return this.next!.get(key);
    }

    del(key: unknown): void {
        if (this.next) return this.next.del(key);
        this.addBranch(key, DELETED, ChangeTypeEnum.del);
    }

    async: boolean = false;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown> {
        if (isTreeSet(c)) {
            this.set(c.key, c.val);
        } else if (isTreeDel(c)) {
            this.del(c.key);

        } else {
            throw new Error('cannot implement change ' + c.type.toString());
        }
        return {
            treeName: c.treeName,
            change: c,
            status: StatusEnum.good
        }
    }
}
