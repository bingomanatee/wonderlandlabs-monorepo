import { Observer, Subscription } from 'rxjs';
import { TreeIF, QueryDef, LeafObj, LeafObjJSONJoins, DataID, Data } from './types';
/**
 * a leaf is a dynamic _reference_ ("pointer") to a record.
 * It has the fields necessary to get the data from the tree.
 * It may also have one or more joined records, identified in $joins,
 */
export declare class Leaf implements LeafObj {
    private $tree;
    $collection: string;
    $identity: DataID;
    constructor($tree: TreeIF, $collection: string, // should be collectionName maybe?
    $identity: DataID);
    $subscribe(observer: Observer<LeafObj>): Subscription;
    $query(queryDef: Partial<QueryDef>): import("rxjs").Observable<LeafObj[]>;
    get $getCollection(): import("./types").CollectionIF;
    get $value(): Data;
    get $exists(): boolean;
    /**
     * the records related to this one, joined to a specific target "name" which is its identity
     */
    $joins: Record<string, LeafObj[]>;
    /**
     * returns a "POJO" snapshot of the data in the tree.
     */
    toJSON(): {
        value: Data;
        identity: DataID;
        collection: string;
        joins: LeafObjJSONJoins;
    } | {
        identity: DataID;
        collection: string;
        $exists: boolean;
    };
}
