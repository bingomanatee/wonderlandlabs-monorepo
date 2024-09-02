import type { ForestIF, TaskFn } from './types.forest';
import type { TreeName, TreeIF, TreeParams } from './types.trees';
import { BehaviorSubject, Observable } from 'rxjs';
export declare class Forest implements ForestIF {
    uniqueTreeName(basis?: string): string;
    private trees;
    hasTree(name: TreeName): boolean;
    tree<ValueType>(name: TreeName): TreeIF<ValueType> | undefined;
    addTree<ValueType>(name: TreeName, params?: TreeParams<ValueType>): TreeIF<ValueType>;
    private _time;
    get nextTime(): number;
    depth: BehaviorSubject<Set<number>>;
    do<ResultType>(change: TaskFn<ResultType>): ResultType;
    private addDepth;
    private unDepth;
    /**
     * observes value changes for a tree when all 'do()' actions have completed.
     * meaning, if any errors are thrown and reset the values, no emissions are made.
     * distinct values mean that only values that are different are emitted.
     * @param name {string}
     * @returns
     */
    observe<ValueType>(name: TreeName): Observable<ValueType>;
}
