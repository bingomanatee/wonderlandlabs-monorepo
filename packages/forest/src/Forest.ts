
import type { ForestIF, LeafIF, LeafReq, TreeIF, TreeName, TreeChange, TreeChangeBase, TreeSet, LeafIdentityIF, Base, Branch, TreeChangeResponse } from "./types"
import { isString } from "./helpers/isString";
import { isTreeChangeIF } from './helpers/isTreeChangeIF';
import { isLeafIdentityIF } from "./helpers/isLeafIdentityIF";

class TreeClass implements TreeIF {
    root: Branch<unknown, unknown> | undefined;
    top: Base<unknown, unknown> | undefined;
    get(key: unknown): LeafIF<unknown, unknown> {
        throw new Error("Method not implemented.");
    }
    has(key: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    set(key: unknown, value: unknown): LeafIF<unknown, unknown> {
        throw new Error("Method not implemented.");
    }
    async: boolean = false;
    t: string;
    change(c: TreeChangeBase<unknown, unknown>): TreeChangeResponse<unknown, unknown> {
        throw new Error("Method not implemented.");
    }

}

class Forest implements ForestIF {
    delete(tree: string | LeafIF<unknown, unknown>, keys?: unknown) {
        throw new Error("Method not implemented.");
    }
    trees: Map<String, TreeIF> = new Map();

    plantTree(t: TreeName, m: Map<unknown, unknown>, upsert?: boolean | undefined): TreeIF {
        if (this.hasTree(t)) {
            if (!upsert) {
                throw new Error('cannot plant existing treer ' + t);
            }
        } else {
            this.trees.set(t, new TreeClass(t, m));
        }
        return this.tree(t);
    }
    get(t: TreeName | LeafIdentityIF, k?: unknown): LeafIF {
        if (!isLeafIdentityIF(t)) {
            return this.get({ t, k });
        }

        if (!this.hasTree(t.t)) {
            throw new Error('forest:get -- cannot find tree ' + t.t);
        }
        const table = this.tree(t.t)!;

        return table.get(t.k);
    }
    set(change: TreeSet | r[]) {
        if (isTreeChangeIF(change)) {
            const oneChange: TreeChangeBase = change as TreeChangeBase;
            const changes: TreeChangeBase[] = [oneChange];
            return this.change(changes);
        }
        return this.change(change);
    }

    private change(c: TreeChange[], t?: TreeName) {
        const responess = [];

        for (const change of c) {
            const treeName = change.t || t;

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


    hasValue(t: TreeName, k: unknown): boolean {
        return this.hasOne({ t, k });
    }
    hasOne(r: LeafReq<unknown>): boolean {
        if (!this.hasTree(r.t)) return false;

        return this.tree(r.t)!.has(r.k);
    }
    hasAll(r: LeafReq<unknown>[]): boolean {
        return r.every((req: LeafReq<unknown>) => { this.hasOne(req) });
    }
    hasTree(t: TreeName): boolean {
        return this.trees.has(t);
    }
    tree(t: TreeName): TreeIF | undefined {
        return this.trees.get(t);
    }



}