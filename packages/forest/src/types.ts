import { UpdateDir, TransStatus } from './constants';
import { Observer, Subscription } from 'rxjs';

export type Obj = Record<string, unknown>;

export type ForestId = string;

type UpdateDirKeys = keyof typeof UpdateDir;
export type UpdateDirType = typeof UpdateDir[UpdateDirKeys];

/* ------------------------ forest -------------------- */

export interface ForestIF {
  createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;

  items: Map<ForestId, ForestItemIF>;

  register(item: ForestItemIF): void;

  trans(name: string, fn: TransFn): void;

  removeTrans(trans: TransIF): void;
}

/* --------------- Leaf -------------------- */

export interface LeafIF {
  value: unknown;

  validate(): void;
}

type validateFn = (value: unknown, leaf: LeafIF) => void; // throws on custom validation error

export type LeafConfig = Obj & { type?: string; validate?: validateFn };

export type JsonObj = Obj;

/* ----------------- ForestItem ---------------------- */

export interface ForestItemIF {
  name: string;
  forest: ForestIF;
  forestId: ForestId;
  value: unknown;
  readonly committedValue: unknown; // the last valid value of the item; may or may not equal value.
  readonly hasTempValues: boolean;

  validate(dir?: UpdateDirType): void; // throws if a target is not valid.
  pushTempValue(
    value: unknown,
    transId: TransID,
    direction?: UpdateDirType
  ): void;

  report(): JsonObj;

  commit(): void;

  flushTemp(): void;

  subscribe(
    observerOrNext?: Partial<Observer<unknown>> | ((value: unknown) => void)
  ): Subscription;
}

/* --------------------- branches -------------------- */

export type childKey = string | number;

export interface BranchIF extends ForestItemIF {
  leaves?: Map<childKey, LeafIF>;

  get(key: childKey): unknown;

  set(key: childKey, value: unknown): void;

  addChild(config: Partial<BranchConfig>, name: string): BranchIF;

  addChildren(children: ChildConfigs): void;

  hasChild(name: childKey): void;
}

export type BranchConfig = Obj & {
  name: string;
  $value: unknown;
  leaves?: Record<string, LeafConfig>;
};

export type ChildConfigs = Record<string, BranchConfig>;

/* --------------- transactions -------------------- */

type TransStatusKeys = keyof typeof TransStatus;
export type TransStatusItem = typeof TransStatus[TransStatusKeys];
export type TransID = string;

export interface TransIF {
  id: TransID;
  status: TransStatusItem;
  name: string;
}

export type TransFn = (trans: TransIF) => void;

export type TransValue = {
  id: TransID;
  value: unknown;
};

/* ------------------ parent/child ----------------- */

export type ChildData = {
  key: string;
  child: ForestItemIF;
};
