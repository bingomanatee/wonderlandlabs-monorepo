import type { TreeName, TreeIF, TreeParams } from "./types.trees";
export type TaskFn<ResultType> = (forest: ForestIF) => ResultType;
export interface ForestIF {
    tree<ValueType>(name: TreeName, caller?: TreeIF<unknown>): TreeIF<ValueType> | undefined;
    addTree<ValueType>(name: TreeName, params?: TreeParams<ValueType>, forest?: ForestIF): TreeIF<ValueType>;
    hasTree(name: TreeName): boolean;
    nextTime: number;
    do<ResultType>(change: TaskFn<ResultType>): ResultType;
}
