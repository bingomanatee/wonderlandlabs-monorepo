import type { BranchIF } from '../types/types.branch';
import type { TreeIF } from '../types/types.trees';
export default class Beaver<ValueType> {
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
    trim(maxCount: number, firstTimeToSave: number, ignoreTime?: boolean): void;
    trimBefore(branch?: BranchIF<ValueType>): void;
    /**
     * this method erases all references contained in branches from the parameter forward.
     *
     * @param fromBranch
     */
    private destoryOldData;
    static limitSize<ValueType>(tree: TreeIF<ValueType>): void;
}
