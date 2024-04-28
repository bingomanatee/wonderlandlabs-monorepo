import {
  UpdateDirType,
  BranchConfig,
  BranchIF,
  ForestIF,
  ForestItemIF,
  LeafConfig,
  LeafIF,
  TransID,
  ChildConfigs,
  childKey,
  BranchConfigDoMethod,
  DoMethod,
} from './types';
import { c } from '@wonderlandlabs/collect';
import { FormEnum, type } from '@wonderlandlabs/walrus';

import Leaf from './Leaf';
import Forest from './Forest';
import ForestItem from './ForestItem';
import { UpdateDir } from './constants';
import { isBranchConfig, isChildConfigs } from './helpers';

export default class Branch extends ForestItem implements BranchIF {
  constructor(private config: BranchConfig, public forest: ForestIF) {
    super(config.name, config.$value, forest);
    this.registerInForest();

    if (config.leaves) {
      c(config.leaves).forEach((config: LeafConfig, name) => {
        this.addLeaf(config, name);
      });
    }

    if (isChildConfigs(config.children)) {
      this.addChildren(config.children);
    }
    if (typeof config.test === 'function') {
      this.test = config.test;
    }

    this._initDo();
  }

  // -------------- Leaves

  public leaves?: Map<string, LeafIF>;

  public addLeaf(config: LeafConfig, name: string) {
    if (!this.leaves) {
      this.leaves = new Map();
    }
    const leaf = new Leaf(this, config, name);
    this.leaves.set(name, leaf);
  }

  // --------------------- value, updating -----------------

  get(name: string) {
    return c(this.value).get(name);
  }

  set(name: string, value: unknown) {
    const val = c(this.value).clone();
    if (val.family !== FormEnum.container) {
      throw new Error('cannot set ' + name + ' to non-container');
    }
    if (this.hasChild(name)) {
      const child = this.child(name);
      if (child) {
        child.value = value;
      }
    } else {
      val.set(name, value);
      this.value = val.value;
    }
  }

  static create(config: BranchConfig, name?: string) {
    const forest = new Forest();
    return forest.createBranch(config, name);
  }

  pushTempValue(value: unknown, id: TransID, direction?: UpdateDirType) {
    const val = c(value).clone();

    if (val.family === FormEnum.container && this.children.size) {
      for (const [ key, child ] of this.children) {
        if (val.hasKey(key) && direction !== UpdateDir.down) {
          child.pushTempValue(val.get(key), id, UpdateDir.up);
        } else {
          val.set(key, child.value);
        }
      }
    }

    super.pushTempValue(val.value, id);

    if (this.parent && direction !== UpdateDir.up) {
      this.parent.pushTempValue(this.parent.value, id, UpdateDir.down);
    }
  }

  public parent?: BranchIF;

  validate(dir?: UpdateDirType) {
    const value = this.value;
    if (
      type.describe(value, true) !== type.describe(this.committedValue, true)
    ) {
      throw new Error('Cannot change type of Branch');
    }
    if (dir !== UpdateDir.down) {
      this.children.forEach((child) => {
        child.validate(UpdateDir.up);
      });

      this.leaves?.forEach((leaf) => leaf.validate());
    }
    super.validate();

    if (this.parent && dir !== UpdateDir.up) {
      this.parent.validate(UpdateDir.down);
    }
  }

  // ----------------------- children ------------------

  public child(name: childKey): ForestItemIF | undefined {
    return this.children.get(name);
  }

  addChild(config: Partial<BranchConfig>, name: childKey) {
    const newConfig = { ...config, name, parent: this };
    if (!isBranchConfig(newConfig)) {
      throw new Error('cannot create branch ' + name);
    }
    const child = new Branch(newConfig, this.forest);
    this.children.set(name, child);
    return child;
    // @note: does not validate.
  }

  addChildren(children: ChildConfigs) {
    c(children).forEach((config: Partial<BranchConfig>, name: string) => {
      this.addChild(config, name);
    });
  }

  hasChild(name: childKey) {
    return this.children.has(name);
  }

  public children: Map<childKey, BranchIF> = new Map();

  // ------------------- actions ------------------------

  do: Record<string, DoMethod> = {};

  _initDo() {
    this.do = {};

    if (this.config.actions) {
      c(this.config.actions).forEach(
        (fn: BranchConfigDoMethod, name: string) => {
          this.do[name] = (...args) => {
            this.forest.trans(name, () => {
              fn(this, ...args);
            });
          };
        }
      );
    }
  }
}
