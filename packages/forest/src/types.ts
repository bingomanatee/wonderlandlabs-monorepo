import { type, TypeEnum } from '@wonderlandlabs/walrus';

export type Obj = Record<string, unknown>;

export function isObj(x: unknown): x is Obj {
  return type.describe(x, true) === TypeEnum.object;
}

export interface ForestIF {
  createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;

  branches: Map<string, BranchIF>;
}

export type LeafConfig = Obj & { type?: string };

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
  return true;
}

export function isLeafIF(x: unknown): x is LeafIF {
  if (!isObj(x)) {
    return false;
  }

  return true;
}

export interface BranchIF {
  name: string;
  readonly value: unknown;
  leaves?: Map<string, LeafIF>;

  get(key: string): unknown;
}

export type BranchConfig = Obj & {
  name: string;
  $value: unknown;
  leaves?: Record<string, LeafConfig>;
};

export function isBranchConfig(x: unknown): x is BranchConfig {
  if (!isObj(x)) {
    return false;
  }
  return '$value' in x && 'name' in x && !!x.name;
}

export interface LeafIF {
  value: unknown;
}
