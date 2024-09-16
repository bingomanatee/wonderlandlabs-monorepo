import type { TreeIF } from '../types/types.trees';
type ActiveTaskInfo = {
    hasActiveTasks: boolean;
    earliestActiveTask: number;
};
export declare class Beaver<ValueType> {
    private tree;
    constructor(tree: TreeIF<ValueType>);
    /**
     *
     * in interest of economy we seek out two branches:
     *  1 the first branch AFTER the first task in play (because we can't trim above that)
     * 2 the earliest branch up to or past the max count (becuase we always want to trim below that).
     *
     * We trim to the LOWEST of these two branches;
     */
    trim(): void;
    /**
     * this method erases all references contained in branches from the parameter forward.
     *
     * @param fromBranch
     */
    private destoryOldData;
    activeTasks(): ActiveTaskInfo;
    limitBranchLength(): void;
}
export {};
