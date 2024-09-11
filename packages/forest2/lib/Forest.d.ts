import type { ForestIF, TaskFn } from './types/types.forest';
import type { TreeName, TreeIF, TreeParams } from './types/types.trees';
import { BehaviorSubject, Observable } from 'rxjs';
import type { InfoParams, Info } from './types/types.shared';
export declare class Forest implements ForestIF {
    uniqueTreeName(basis?: string): string;
    private trees;
    hasTree(name: TreeName): boolean;
    tree<ValueType>(name: TreeName): TreeIF<ValueType> | undefined;
    get treeNames(): string[];
    addTree<ValueType>(name: TreeName, params?: TreeParams<ValueType>): TreeIF<ValueType>;
    private _time;
    get time(): number;
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
    private _notes?;
    addNote(message: string, params?: InfoParams): void;
    hasNoteAt(time: number): boolean;
    notes(fromTime: number, toTime?: number): Info[];
}
