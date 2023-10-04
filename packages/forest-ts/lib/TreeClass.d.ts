import { CollectionDef, JoinSchema, LeafObj, QueryDef, QueryDefJoin, TransAction, Tree, UpdateMsg } from './types';
import CollectionClass from './CollectionClass';
import { SubjectLike } from 'rxjs';
export declare class TreeClass implements Tree {
    $collections: Map<string, CollectionClass>;
    joins: Map<string, JoinSchema>;
    constructor(collections?: CollectionDef[], joins?: JoinSchema[]);
    addCollection(content: CollectionDef): void;
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
