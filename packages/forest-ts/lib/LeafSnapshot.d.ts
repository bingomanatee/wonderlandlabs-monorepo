import { LeafObj, LeafRecord } from './types';
import { TreeClass } from './TreeClass';
import { Subscription } from 'rxjs';
export default class LeafSnapshot implements LeafObj<unknown> {
    private $tree;
    $collection: string;
    $identity: unknown;
    $value: LeafRecord;
    constructor($tree: TreeClass, $collection: string, $identity: unknown);
    toJSON(): {
        value: LeafRecord;
        collection: string;
        identity: unknown;
    };
    $subscribe(): Subscription;
    static fromLeafObj(leaf: LeafObj<any>): LeafSnapshot;
}
