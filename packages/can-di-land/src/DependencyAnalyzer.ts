import { ResConfig, Key, ValueMap } from './types'
import { PromiseQueue } from './PromiseQueue'
import { c } from '@wonderlandlabs/collect'

type CanDiType = {
  configs: Map<Key, ResConfig>,
  pq: PromiseQueue,
  resAsFunction(key: Key, values ?: ValueMap): (...params: any) => any
}

type DepError = { root?: Key, to?: Key, msg: string }

export class DependencyAnalyzer {
  constructor(public can: CanDiType) {
    can.configs.forEach((config: ResConfig, configKey: Key) => {
      config.deps?.forEach((dep) => {
        this._addDep(configKey, dep);
      })
    })
  }

  public get errors() {
    let errs: DepError[] = [];

    this.dependsOn.forEach((list, parentKey) => {
      list.forEach((dep) => {

        if (this.loop(parentKey, dep)) {
          errs.push({ msg: 'loop', root: parentKey, to: dep })
        }
      })
    });

    return errs;
  }

  private _trace(path: Key[]) {
    const last = path[path.length - 1];
    if (this.dependsOn.has(last)) {
      const nextSet = this.dependsOn.get(last)!;
      nextSet.forEach((dep) => {
        if (path.includes(dep)) {
          throw Object.assign(new Error('loop'), { path: [...path, dep] });
        }
        this._trace([...path, dep]);
      });
    }
  }

  private loop(fromKey: Key, toKey: Key) {
    try {
      this._trace([fromKey, toKey]);
    } catch (err) {
      return true;
    }
    return false;
  }

  public dependsOn: Map<Key, Key[]> = new Map();

  private _addDep(parent: Key, depKey: Key) {
    if (!this.dependsOn.has(parent)) {
      this.dependsOn.set(parent, [depKey]);
    } else if (!this.dependsOn.get(parent)!.includes(depKey)) {
      this.dependsOn.get(parent)!.push(depKey)
    }
  }

  updateComputed(allValues: Map<any, any>, changedValues: ValueMap) {
    if (this.errors?.length) {
      console.error('cannot update dependencies - loop:', this.errors);
      return;
    }

    const nodes: DepNode[] = Array.from(c(this.dependsOn).getMap((deps, parentId) => {
      return new DepNode(this, parentId, deps);
    }).values())

    const nodeMap = new Map();
    nodes.forEach((node) => nodeMap.set(node.key, node));
    nodes.forEach(node => node.link(nodeMap));

    const rootNodes = nodes.filter((node) => node.isRoot);

    rootNodes.forEach((node) => {
      node.recompute(allValues, changedValues, []);
    })
  }
}

class DepNode {
  constructor(private da: DependencyAnalyzer, public key: Key, public deps: Key[]) {
  }

  get isRoot() {
    return this.parentNodes.size === 0;
  }

  /**
   * recompute values in allValues if
   * a) their deps includes a changed value
   * b) their deps includes a recomputed value
   */
  recompute(allValues: Map<any, any>, changedValues: ValueMap, recomputedIds: any[]) {
    const can: CanDiType = this.da.can;
    this.childNodes.forEach((node) => node.recompute(allValues, changedValues, recomputedIds))
      if (can.configs.get(this.key)?.final) {
        if(allValues.has(this.key)) {
          return;
        }

        if (!this.deps.every((depKey) => allValues.has(depKey))) {
          // cannot compute node - missing deps
          return;
        }

        if (!this.deps.some((depKey) => recomputedIds.includes(depKey) || changedValues.has(depKey))) {
          // there were no changed dependencies, and no dependency was recomputed
          return;
        }

        allValues.set(this.key, can.resAsFunction(this.key, allValues)());
      }
  }

  link(nodeMap: Map<Key, DepNode>) {
    this.deps.forEach((depKey) => {
      const childNode = nodeMap.get(depKey);
      if (childNode) {
        childNode.parentNodes.set(this.key, this);
        this.childNodes.set(childNode.key, childNode);
      }
    })
  }

  public parentNodes = new Map();
  public childNodes = new Map();
}
