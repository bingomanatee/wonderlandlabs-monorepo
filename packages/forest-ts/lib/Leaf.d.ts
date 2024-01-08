import { LeafObj, LeafObjJSONJoins, QueryDef, Tree } from './types';
import { Observer, Subscription } from 'rxjs';
/**
 * a leaf is a dynamic _reference_ ("pointer") to a record.
 * It has the fields necessary to get the data from the tree.
 * It may also have one or more joined records, identified in $joins,
 */
export declare class Leaf<ValueType> implements LeafObj<ValueType> {
    private $tree;
    $collection: string;
    $identity: any;
    constructor($tree: Tree, $collection: string, // should be collectionName maybe?
    $identity: any);
    $subscribe(observer: Observer<LeafObj<ValueType>>): Subscription;
    $query(queryDef: Partial<QueryDef>): import("rxjs").Observable<LeafObj<any>[]>;
    get $getCollection(): import("./CollectionClass").default;
    get $value(): any;
    get $exists(): any;
    /**
     * the records related to this one, joined to a specific target "name" which is its identity
     */
    $joins: Record<string, LeafObj<any>[]>;
    /**
     * returns a "POJO" snapshot of the data in the tree.
     */
    toJSON(): {
        identity: any;
        collection: string;
        value: undefined;
        $exists: boolean;
        joins?: undefined;
    } | {
        value: any;
        identity: any;
        collection: string;
        joins: LeafObjJSONJoins;
        $exists?: undefined;
    };
}
