import { CollectionDef, JoinSchema, LeafObj, QueryDef, QueryDefJoin, TransAction, Tree, UpdateMsg } from './types';
import CollectionClass from './CollectionClass';
import { SubjectLike } from 'rxjs';
/**
 * A Tree is a "local database" -- a collection of collections and the definitions
 * of how the records are related to each other.
 */
export declare class TreeClass implements Tree {
    $collections: Map<string, CollectionClass>;
    joins: Map<string, JoinSchema>;
    constructor(collections?: CollectionDef[], joins?: JoinSchema[]);
    addCollection(config: CollectionDef): void;
    private _indexes;
    addJoin(join: JoinSchema): void;
    do(action: TransAction): void;
    collection(name: string): CollectionClass;
    get(collection: string, id: any): any;
    put(collection: string, value: any): void;
    query(query: QueryDef): import("rxjs").Observable<LeafObj<any>[]>;
    fetch(query: QueryDef): any;
    findMatchingJoins(collection: string, coll2: string): any;
    leaf(collection: string, id: any, query?: QueryDefJoin): LeafObj<any>;
    updates: SubjectLike<UpdateMsg>;
}
