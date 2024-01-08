import { LeafObj, Data } from './types';
import { TreeClass } from './TreeClass';
import { Subscription } from 'rxjs';
export default class LeafSnapshot implements LeafObj<unknown> {
    private $tree;
    $collection: string;
    $identity: unknown;
    $value: Data;
    constructor($tree: TreeClass, $collection: string, $identity: unknown);
    toJSON(): {
        value: Data;
        collection: string;
        identity: unknown;
    };
    $subscribe(): Subscription;
    static fromLeafObj(leaf: LeafObj<any>): LeafSnapshot;
}
