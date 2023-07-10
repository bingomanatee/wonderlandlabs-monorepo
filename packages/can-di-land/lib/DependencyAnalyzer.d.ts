import { ResConfig, Key, ValueMap } from './types';
import { PromiseQueue } from './PromiseQueue';
type CanDiType = {
    configs: Map<Key, ResConfig>;
    pq: PromiseQueue;
    resAsFunction(key: Key, values?: ValueMap): (...params: any) => any;
};
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
