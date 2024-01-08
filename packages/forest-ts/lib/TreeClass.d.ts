import { SubjectLike } from 'rxjs';
import { JoinSchema, QueryDef, QueryDefJoin } from './types/types.query-and-join';
import { LeafObj } from './types/types.leaf';
import { CollectionDef, CollectionIF, DataID, DoProps, TransAction, TransHandlerIF, TreeIF, UpdateMsg } from './types';
/**
 * A Tree is a "local database" -- a collection of collections and the definitions
 * of how the records are related to each other.
 */
export declare class TreeClass implements TreeIF {
    constructor(collections?: CollectionDef[], joins?: JoinSchema[]);
    $collections: Map<string, CollectionIF>;
    joins: Map<string, JoinSchema>;
    addCollection(config: CollectionDef): void;
    private _indexes;
    addJoin(join: JoinSchema): void;
    private $_transManager?;
    /** perform a synchronous task that is enveloped by
     * transactional fallback
     */
    do(action: TransAction, props?: DoProps): unknown;
    collection(name: string): CollectionIF;
    get(collection: string, id: any): any;
    put(collection: string, value: any): DataID;
    query(query: QueryDef): import("rxjs").Observable<LeafObj[]>;
    fetch(query: QueryDef): any;
    findMatchingJoins(collection: string, coll2: string): any;
    leaf(collection: string, id: DataID, query?: QueryDefJoin): LeafObj;
    updates: SubjectLike<UpdateMsg>;
    has(coll: string, id: DataID): boolean;
    hasCollection(coll: string): boolean;
    revert(actions: TransHandlerIF[]): void;
}
