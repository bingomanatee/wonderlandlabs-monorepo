import { LeafObj, LeafObjJSONJoins, QueryDef, Tree } from './types';
import { Observer, Subscription } from 'rxjs';
export declare class Leaf<ValueType> implements LeafObj<ValueType> {
    private $tree;
    private $collection;
    $identity: any;
    constructor($tree: Tree, $collection: string, $identity: any);
    $subscribe(observer: Observer<LeafObj<ValueType>>): Subscription;
    $query(queryDef: Partial<QueryDef>): import("rxjs").Observable<LeafObj<any>[]>;
    get $getCollection(): import("./CollectionClass").default;
    get $value(): any;
    get $exists(): any;
    $joins: Record<string, LeafObj<any>[]>;
    toJSON(): {
        value: any;
        identity: any;
        collection: string;
        joins: LeafObjJSONJoins;
    };
}
