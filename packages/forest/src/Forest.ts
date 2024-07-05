import type {
  ForestIF,
  LeafIF,
  LeafIdentityIF,
  TreeIF,
  TreeName,
  TreeChange,
  ChangeResponse,
  ScopeIF,
  ScopeFn,
} from "./types";
import type {
  ForestParams,
  ScopeParams,
  TreeFactoryParams,
} from "./helpers/paramTypes";
import { isString } from "./helpers/isString";
import { isLeafIdentityIF } from "./helpers/isLeafIdentityIF";
import { Tree } from "./Tree";
import { isLeafIF } from "./helpers/isLeafIF";
import { DELETED } from "./constants";
import { Action, Change_s, Status_s } from "./helpers/enums";
import Scope from "./Scope";

const DEFAULT_CACHE_INTERVAL = 8;

function scopeError(scope: ScopeIF, err: Error, scopesRemoved: ScopeIF[]) {
  return {
    ...err,
    scope: scope.scopeID,
    removed: scopesRemoved.map((s) => s.scopeID),
  };
}

export class Forest implements ForestIF {
  constructor(params?: ForestParams) {
    this.cacheInterval = params?.cacheInterval || DEFAULT_CACHE_INTERVAL;
  }

  public readonly cacheInterval;

  private _nextBranchId = 1; // static?
  nextBranchId(): number {
    const id = this._nextBranchId;
    this._nextBranchId += 1;
    return id;
  }

  // ---------------- TREE -----------------
  trees: Map<string, TreeIF> = new Map();
  addTree(params: TreeFactoryParams): TreeIF {
    const { name: treeName, data, upsert } = params;

    if (this.hasTree(treeName)) {
      if (!upsert) {
        throw new Error("cannot redefine existing treer " + treeName);
      }
    } else {
      this.trees.set(
        treeName,
        new Tree({
          forest: this,
          treeName,
          data,
        })
      );
    }
    return this.tree(treeName)!;
  }

  // --------------- ACTIONS -----------------

  delete(treeName: TreeName | LeafIF, key?: unknown): ChangeResponse {
    if (isLeafIF(treeName)) {
      return this.delete(treeName.treeName, treeName.key);
    }
    if (!this.hasTree(treeName)) {
      throw new Error("cannot delete from " + treeName + ": no tree found");
    }
    this.tree(treeName)!.del(key!);
    return {
      treeName: treeName,
      status: this.tree(treeName)!.status,
      change: {
        key,
        val: DELETED,
        treeName: treeName,
        type: Change_s.del,
      },
    };
  }

  get(treeNameOrLeaf: TreeName | LeafIdentityIF, key?: unknown): LeafIF {
    if (!isLeafIdentityIF(treeNameOrLeaf)) {
      return this.get({ treeName: treeNameOrLeaf, key: key });
    }

    if (!this.hasTree(treeNameOrLeaf.treeName)) {
      throw new Error(
        "forest:get -- cannot find tree " + treeNameOrLeaf.treeName
      );
    }
    const tree = this.tree(treeNameOrLeaf.treeName)!;

    return tree.leaf(treeNameOrLeaf.key);
  }

  set(
    treeNameOrLeaf: TreeName | LeafIF,
    key?: unknown,
    val?: unknown
  ): ChangeResponse {
    if (!isLeafIF(treeNameOrLeaf)) {
      if (!this.hasTree(treeNameOrLeaf)) {
        throw new Error("cannot set - no tree " + treeNameOrLeaf);
      }
      const tree = this.tree(treeNameOrLeaf)!;
      tree?.set(key, val);
      return {
        treeName: treeNameOrLeaf,
        change: {
          treeName: treeNameOrLeaf,
          key,
          val,
          type: Change_s.set,
        },
        status: tree.status,
      };
    }
    return this.set(
      treeNameOrLeaf.treeName,
      treeNameOrLeaf.key,
      treeNameOrLeaf.val
    );
  }

  private change(c: TreeChange[], treeName?: TreeName) {
    const responess = [];

    for (const change of c) {
      if (!change.treeName || treeName) {
        throw new Error("change: requires treeName");
      }
      //@ts-ignore
      const name: TreeName = change.treeName || treeName;

      if (!isString(name) || !this.hasTree(name)) {
        throw new Error("change missing tree name");
      }

      const tree = this.tree(name)!;
      responess.push(tree.change(change));
    }

    return responess.flat();
  }

  // ------------------- REFLECTION

  hasKey(treeName: TreeName, k: unknown): boolean {
    return this.has({ treeName: treeName, key: k });
  }
  has(r: LeafIdentityIF<unknown>): boolean {
    if (!this.hasTree(r.treeName)) {
      return false;
    }

    return this.tree(r.treeName)!.has(r.key);
  }
  hasAll(r: LeafIdentityIF<unknown>[]): boolean {
    return r.every((req: LeafIdentityIF<unknown>) => {
      this.has(req);
    });
  }
  hasTree(treeName: TreeName): boolean {
    return this.trees.has(treeName);
  }
  tree(treeName: TreeName): TreeIF | undefined {
    return this.trees.get(treeName);
  }

  // ------------------ SCOPES, TRANSACT ----------------

  private scopes: ScopeIF[] = [];
  private pruneScope(sc: ScopeIF) {
    const index = this.scopes.indexOf(sc);
    if (index < 0) {
      throw new Error("cannot find scope to prune");
    }
    const scopesToClear = this.scopes.slice(index);
    this.scopes = this.scopes.slice(0, index);

    // prune currentScope and all subsequent scopes
    scopesToClear.forEach((clearedScope) => {
      clearedScope.inTrees.forEach((treeName: TreeName) => {
        try {
          const tree = this.tree(treeName);
          tree?.pruneScope(clearedScope.scopeID);
        } catch (err2) {
          console.error("error removing scope", sc, err2);
        }
      });
    });
    return scopesToClear;
  }

  public get currentScope() {
    return this.scopes[this.scopes.length - 1];
  }

  // for debugging; a list of all scopes that have finished - succeeedd OR failed.
  public completedScopes: ScopeIF[] = [];
  public maxCompletedScopes = 20; // cap the list for memory
  private archiveScope(sc: ScopeIF) {
    if (this.maxCompletedScopes > 0) {
      this.completedScopes.push(sc);
      if (this.completedScopes.length > this.maxCompletedScopes) {
        this.completedScopes = this.completedScopes.slice(
          -this.maxCompletedScopes
        );
      }
    }
  }

  transact(fn: ScopeFn, params: ScopeParams = {}, ...args: never[]) {
    const sc = new Scope(this, params);
    this.scopes.push(sc);
    let out;

    // attempt to run the function (sync) with the scope in play
    try {
      out = fn(this, ...args);
    } catch (err) {
      sc.error = err as Error;
      // remove the scope AND ALL SUBSEQUENT SCOPES from the currentScopes;
      const scopesRemoved = this.pruneScope(sc);
      sc.status = Status_s.bad;
      // record the scope in the completedScopes for debugging;
      this.archiveScope(sc);
      throw scopeError(sc, err as Error, scopesRemoved);
      // throwing - if not caught will cascade and eventually, take ALL pending scopes down.
    }

    sc.status = Status_s.good;
    // record the scope in the completedScopes for debugging;
    this.archiveScope(sc);

    /*    
      on a successful run, remove the scope from all trees.
      note: if this is successful, by definition,
       any internal scopes were successful and have completed. 
       So, this should be the last scope on the stack. 
     */
    sc.inTrees.forEach((treeName: TreeName) => {
      try {
        const tree = this.tree(treeName);
        tree?.endScope(sc.scopeID);
      } catch (err3) {
        console.error("error ending scope", sc, err3);
      }
    });

    return out;
  }
}
