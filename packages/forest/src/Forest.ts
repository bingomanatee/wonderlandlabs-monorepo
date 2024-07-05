
import type {
    ForestIF, LeafIF, LeafIdentityIF, TreeIF,
    TreeName, TreeChange,
    ChangeResponse
} from "./types"
import type { ForestParams, TreeFactoryParams } from "./helpers/paramTypes";
import { isString } from "./helpers/isString";
import { isLeafIdentityIF } from "./helpers/isLeafIdentityIF";
import { Tree } from "./Tree";
import { isLeafIF } from "./helpers/isLeafIF";
import { DELETED } from "./constants";
import { ChangeTypeEnum } from "./helpers/enums";

const DEFAULT_CACHE_INTERVAL = 8;

export class Forest implements ForestIF {

    constructor(params?: ForestParams) {
        this.cacheInterval = params?.cacheInterval || DEFAULT_CACHE_INTERVAL;
    }

    public readonly cacheInterval;

    delete(treeName: TreeName | LeafIF, key?: unknown): ChangeResponse {
        if (isLeafIF(treeName)) {
            return this.delete(treeName.treeName, treeName.key);
        }
        if (!this.hasTree(treeName)) {
            throw new Error('cannot delete from ' + treeName + ': no tree found');
        }
        this.tree(treeName)!.del(key!);
        return {
            treeName: treeName,
            status: this.tree(treeName)!.status,
            change: { key, val: DELETED, treeName: treeName, type: ChangeTypeEnum.del }
        }
    }
    trees: Map<String, TreeIF> = new Map();
    private _nextBranchId = 1; // static?
    nextBranchId(): number {
        const id = this._nextBranchId;
        this._nextBranchId += 1;
        return id;
    }



    addTree(params: TreeFactoryParams): TreeIF {

        const { name: treeName, data, upsert } = params;

        if (this.hasTree(treeName)) {
            if (!upsert) {
                throw new Error('cannot redefine existing treer ' + treeName);
            }
        } else {
            this.trees.set(treeName, new Tree({
                forest: this,
                treeName,
                data
            }));
        }
        return this.tree(treeName)!;
    }
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF {
        if (!isLeafIdentityIF(treeNameOrLeaf)) {
            return this.get({ treeName: treeNameOrLeaf, key: key });
        }

        if (!this.hasTree(treeNameOrLeaf.treeName)) {
            throw new Error('forest:get -- cannot find tree ' + treeNameOrLeaf.treeName);
        }
        const tree = this.tree(treeNameOrLeaf.treeName)!;

        return tree.leaf(treeNameOrLeaf.key);
    }
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse {
        if (!isLeafIF(treeNameOrLeaf)) {
            if (!this.hasTree(treeNameOrLeaf)) throw new Error('cannot set - no tree ' + treeNameOrLeaf);
            const tree = this.tree(treeNameOrLeaf)!;
            tree?.set(key, val);
            return {
                treeName: treeNameOrLeaf,
                change: {
                    treeName: treeNameOrLeaf,
                    key, val, type: ChangeTypeEnum.set
                },
                status: tree.status
            }
        }
        return this.set(treeNameOrLeaf.treeName, treeNameOrLeaf.key, treeNameOrLeaf.val);
    }

    private change(c: TreeChange[], treeName?: TreeName) {
        const responess = [];

        for (const change of c) {
            if (!change.treeName || treeName) throw new Error('change: requires treeName');
            //@ts-ignore
            const name: TreeName = change.treeName || treeName;

            if (!isString(name) || !this.hasTree(name)) {
                throw new Error('change missing tree name');
            }

            const tree = this.tree(name)!;
            responess.push(
                tree.change(change)
            );
        }

        return responess.flat();
    }


    hasKey(treeName: TreeName, k: unknown): boolean {
        return this.has({ treeName: treeName, key: k });
    }
    has(r: LeafIdentityIF<unknown>): boolean {
        if (!this.hasTree(r.treeName)) return false;

        return this.tree(r.treeName)!.has(r.key);
    }
    hasAll(r: LeafIdentityIF<unknown>[]): boolean {
        return r.every((req: LeafIdentityIF<unknown>) => { this.has(req) });
    }
    hasTree(treeName: TreeName): boolean {
        return this.trees.has(treeName);
    }
    tree(treeName: TreeName): TreeIF | undefined {
        return this.trees.get(treeName);
    }



}