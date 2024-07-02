import type {
    BranchConfig, LeafIF, TreeIF, ChangeBase, BranchIF,
    ChangeResponse
} from "./types";

import type { Status, BranchAction } from "./enums";
import { StatusEnum, BranchActionEnum, ChangeTypeEnum } from "./enums";
import { Leaf } from './Leaf';
import { mp } from "./helpers";
import { DELETED, NOT_FOUND } from "./constants";

export class Branch implements BranchIF {
    constructor(public tree: TreeIF, config: BranchConfig) {
        this.cause = config.cause;
        this.status = StatusEnum.good;
        this.data = this._initData(config);
        if (config.prev) this.prev = config.prev;
        //@TODO: validate.
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
    get(key: unknown): LeafIF {
        if (this.data.has(key)) return this.leafFactory(key, this.data.get(key));
        if (this.prev) {
            const leaf = this.prev.get(key);
            if (leaf.hasValue) this.data.set(key, leaf.val);
            return leaf;
        }
        return this.leafFactory(key, NOT_FOUND);
    }

    private leafFactory(k: unknown, v?: unknown) {
        return new Leaf(
            {
                treeName: this.tree.treeName,
                key: k,
                val: v,
                forest: this.tree.forest
            });
    }

    private push(key: unknown, val: unknown, cause: BranchAction) {
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
    set(key: unknown, val: unknown): LeafIF {
        if (this.next) return this.next.set(key, val);
        this.push(key, val, BranchActionEnum.set);
        //@TODO: validate
        return this.next!.get(key);
    }

    del(key: unknown): LeafIF<unknown, unknown> {
        if (this.next) return this.next.del(key);
        this.push(key, DELETED, ChangeTypeEnum.del);
        return this.next!.get(key);
    }

    async: boolean = false;
    change(c: ChangeBase<unknown, unknown>): ChangeResponse<unknown, unknown> {
        throw new Error("Method not implemented.");
    }
}
