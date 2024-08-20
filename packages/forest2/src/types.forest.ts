import type { TreeName, TreeIF } from "./types.trees";

export type SeasonFn<ResultType> = (forest: ForestIF) => ResultType;

export interface ForestIF {
  tree<ValueType>(
    name: TreeName,
    caller?: TreeIF<unknown>
  ): TreeIF<ValueType> | undefined;
  addTree<ValueType>(
    name: TreeName,
    initialValue: ValueType,
    caller?: TreeIF<unknown>
  ): TreeIF<ValueType>;
  hasTree(name: TreeName, caller?: TreeIF<unknown>): boolean;
  removeTree(
    name: TreeName,
    caller?: TreeIF<unknown>
  ): TreeIF<unknown> | undefined;

  nextTime: number;

  season<ResultType>(change: SeasonFn<ResultType>): ResultType;
}
