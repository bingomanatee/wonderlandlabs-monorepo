import type { TaskFn } from "./types.forest";
import type { TreeName, TreeIF, TreeParams } from "./types.trees";
export declare class Forest {
    private trees;
    hasTree(name: TreeName): boolean;
    tree<ValueType>(name: TreeName): TreeIF<any> | undefined;
    addTree<ValueType>(name: TreeName, params?: TreeParams<ValueType>): TreeIF<ValueType>;
    private _time;
    get nextTime(): number;
    do<ResultType>(change: TaskFn<ResultType>): ResultType;
}
