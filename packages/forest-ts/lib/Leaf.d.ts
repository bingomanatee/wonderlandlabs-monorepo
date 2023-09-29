import { LeafObj, QueryDef, Tree } from './types';
import { Observer } from 'rxjs';
export declare class Leaf<ValueType> implements LeafObj<ValueType> {
    private $tree;
    private $collection;
    $identity: any;
    constructor($tree: Tree, $collection: string, $identity: any);
    $subscribe(observer: Observer<LeafObj<ValueType>>): import("rxjs").Subscription;
    $query(queryDef: Partial<QueryDef>): import("rxjs").Observable<LeafObj<any>[]>;
    get $getCollection(): import("./CollectionClass").default;
    get $value(): any;
}
