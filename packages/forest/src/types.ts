import { type, TypeEnum } from '@wonderlandlabs/walrus';

export type Obj = Record<string, unknown>;

export function isObj(x: unknown): x is Obj {
  return type.describe(x, true) === TypeEnum.object;
}

export interface ForestIF {
  createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;

  branches: Map<string, BranchIF>;
}

export interface BranchIF {
  name: string;
  value: unknown;
}

export type BranchConfig = Obj & { name: string; $value: unknown };

export function isBranchConfig(x: unknown): x is BranchConfig {
  if (!isObj(x)) {
    return false;
  }
  return '$value' in x && 'name' in x && !!x.name;
}

export interface LeafIF {
  value: unknown;
}

export type LeafConfig = Obj & { name: string };

export function isLeafConfig(x: unknown): x is LeafConfig {
  if (!isObj(x)) {
    return false;
  }
  return 'name' in x && !!x.name;
}
