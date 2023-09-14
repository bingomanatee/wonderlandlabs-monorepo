import { LeafId, LeafObj } from './types';
import { Tree } from './types';
export declare class TreeClass implements Tree {
    private root;
    constructor(root: LeafObj<any>);
    private leaves;
    addLeaf(leaf: LeafObj<any>): void;
    value(leafId: LeafId): any;
    private pending;
    private get lastPending();
    update(leafId: LeafId, value: any): void;
}
