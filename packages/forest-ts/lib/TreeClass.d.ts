import { CollectionDef, LeafObj, QueryDef, TransAction, Tree } from './types';
import CollectionClass from './CollectionClass';
export declare class TreeClass implements Tree {
    $collections: Map<string, CollectionClass>;
    addCollection(content: CollectionDef, values?: any[]): void;
    do(action: TransAction): void;
    collection(name: string): CollectionClass;
    get(collection: string, id: any): any;
    put(collection: string, value: any): void;
    query(query: QueryDef): import("rxjs").Observable<LeafObj<any>[]>;
    fetch(query: QueryDef): any;
    leaf(collection: string, id: any): LeafObj<any>;
}
