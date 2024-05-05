import { type, TypeEnum } from '@wonderlandlabs/walrus';
import {
  BranchConfig,
  ChildConfigs,
  ForestItemTransactionalIF,
  LeafConfig,
  LeafIF,
  Obj,
} from './types';

export function isObj(x: unknown): x is Obj {
  return type.describe(x, true) === TypeEnum.object;
}

export function isLeafConfig(x: unknown): x is LeafConfig {
  if (!isObj(x)) {
    return false;
  }
  if ('type' in x) {
    if (type.describe(x.type, true) !== TypeEnum.string) {
      return false;
    }
  }
  if ('strict' in x) {
    if (type.describe(x.strict, true) !== TypeEnum.boolean) {
      return false;
    }
  }
  if ('validate' in x) {
    if (typeof x.validate !== 'function') {
      return false;
    }
  }
  return true;
}

export function isLeafIF(x: unknown): x is LeafIF {
  if (!isObj(x)) {
    return false;
  }

  return true;
}

export function isBranchConfig(x: unknown): x is BranchConfig {
  if (!isObj(x)) {
    return false;
  }
  return '$value' in x && 'name' in x && !!x.name;
}

export function isChildConfigs(x: unknown): x is ChildConfigs {
  if (!isObj(x)) {
    return false;
  }
  if ('name' in x) {
    if (type.describe(x.name, true) !== TypeEnum.string) {
      return false;
    }
  }
  if ('children' in x) {
    if (!Array.isArray(x.children)) {
      return false;
    }
    if (!x.children.every(isBranchConfig)) {
      return false;
    }
  }
  return true;
}

export function isTransactionalIF(x: unknown): x is ForestItemTransactionalIF {
  if (!isObj(x)) {
    return false;
  }
  if (typeof x.pushTempValue !== 'function') {
    return false;
  }
  if (typeof x.flushTemp !== 'function') {
    return false;
  }
  if (typeof x.commit !== 'function') {
    return false;
  }
  if (typeof x.removeTempValues !== 'function') {
    return false;
  }
  return true;
}
