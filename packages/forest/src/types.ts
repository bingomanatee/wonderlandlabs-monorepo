export type DataEngineName = string;
export type TreeName = string;
export type ActionName = string;
export type GenObj = Record<string, unknown>;

export type ActionMap = Map<ActionName, ActionIF>;

export interface DataEngineIF {
  name: DataEngineName;
  valitator?: (data: unknown) => boolean;
  actions: ActionMap;
}

export type TreeSeed = {
  initialValue?: unknown;
  dataEngine: DataEngineName;
};

export interface ActionIF {
  name: ActionName;
  cacheable?: boolean;
  generator(
    tree: TreeIF,
    value?: unknown,
    options?: GenObj
  ): BranchIF | undefined; //  to produce a branch for this action
  delta(branch: BranchIF, modifier?: unknown): unknown; // how to derive a value for a given branch
}

export interface BranchIF {
  readonly value: unknown;
  prev?: BranchIF;
  next?: BranchIF;
  tree: TreeIF;
  action: ActionIF;
  push(branch: BranchIF): void;
  popMe(): BranchIF;
  cutMe(): BranchIF;
  destroy(): void;
  isTop: boolean;
  isRoot: boolean;
  data?: unknown;
  isAlive: boolean;
}

export interface TreeIF {
  root: BranchIF;
  top: BranchIF;
  readonly dataEngine: DataEngineName;
  readonly forest: ForestIF;
  readonly value: unknown;
  do(name: ActionName, value?: unknown, options?: GenObj): BranchIF;
}

export interface ForestIF {
  tree(name: TreeName, seed?: TreeSeed): TreeIF | undefined;
  dataEngine(nameOrEngine: DataEngineName | DataEngineIF): DataEngineIF;
}
