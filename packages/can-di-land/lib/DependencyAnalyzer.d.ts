import { CanDiType, Key, ValueMap } from "./types";
type DepError = {
  root?: Key;
  to?: Key;
  msg: string;
};
export declare class DependencyAnalyzer {
  can: CanDiType;
  constructor(can: CanDiType);
  get errors(): DepError[];
  private _trace;
  private loop;
  dependsOn: Map<Key, Key[]>;
  private _addDep;
  updateComputed(allValues: Map<any, any>, changedValues: ValueMap): void;
}
export {};
