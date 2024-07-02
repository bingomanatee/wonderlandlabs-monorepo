
import type {
    ForestIF, LeafIF, LeafReq, TreeIF,
    TreeName, TreeChange, ChangeBase, ChangeSet, LeafIdentityIF,
    ChangeResponse
} from "./types"
import { isString } from "./helpers/isString";
import { isChangeIF } from './helpers/isChangeIF';
import { isLeafIdentityIF } from "./helpers/isLeafIdentityIF";
import { Tree } from "./Tree";
import { isLeafIF } from "./helpers/isLeafIF";
import { DELETED } from "./constants";
import { ChangeTypeEnum } from "./enums";

export class Forest implements ForestIF {
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

    treeFactory(t: TreeName, m: Map<unknown, unknown>, upsert?: boolean | undefined): TreeIF {
        if (this.hasTree(t)) {
            if (!upsert) {
                throw new Error('cannot plant existing treer ' + t);
            }
        } else {
            this.trees.set(t, new Tree(this, t, m));
        }
        return this.tree(t)!;
    }
    get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF {
        if (!isLeafIdentityIF(treeNameOrLeaf)) {
            return this.get({ treeName: treeNameOrLeaf, key: key });
        }

        if (!this.hasTree(treeNameOrLeaf.treeName)) {
            throw new Error('forest:get -- cannot find tree ' + treeNameOrLeaf.treeName);
        }
        const table = this.tree(treeNameOrLeaf.treeName)!;

        return table.get(treeNameOrLeaf.key);
    }
    set(treeNameOrLeaf: TreeName | LeafIF, key?: unknown, val?: unknown): ChangeResponse {
        if (!isLeafIF(treeNameOrLeaf)) {
            if (!this.hasTree(treeNameOrLeaf)) throw new Error('cannot set - no tree ' + treeNameOrLeaf);
            const tree = this.tree(treeNameOrLeaf)!;
            tree?.set(key, val);
            return {
                treeName: treeNameOrLeaf,
                change: {
                    key, val, type: ChangeTypeEnum.set
                },
                status: tree.status
            }
        }
        return this.set(treeNameOrLeaf.treeName, treeNameOrLeaf.key, treeNameOrLeaf.val);
    }

    private change(c: TreeChange[], t?: TreeName) {
        const responess = [];

        for (const change of c) {
            const treeName = change.treeName || t;

            if (!isString(treeName) || !this.hasTree(treeName)) {
                throw new Error('change missing tree name');
            }

            const tree = this.tree(treeName)!;
            responess.push(
                tree.change(change)
            );
        }

        return responess.flat();
    }


    hasKey(t: TreeName, k: unknown): boolean {
        return this.has({ treeName: t, key: k });
    }
    has(r: LeafReq<unknown>): boolean {
        if (!this.hasTree(r.treeName)) return false;

        return this.tree(r.treeName)!.has(r.key);
    }
    hasAll(r: LeafReq<unknown>[]): boolean {
        return r.every((req: LeafReq<unknown>) => { this.has(req) });
    }
    hasTree(t: TreeName): boolean {
        return this.trees.has(t);
    }
    tree(t: TreeName): TreeIF | undefined {
        return this.trees.get(t);
    }



}