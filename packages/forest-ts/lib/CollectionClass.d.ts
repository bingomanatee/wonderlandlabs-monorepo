import { CollectionDef, Data, QueryDef, RecordFieldSchema, Tree } from './types';
import { BehaviorSubject } from 'rxjs';
type RecordMap = Map<any, any>;
/**
 * This is a bundle of records with the same fields.
 * There is a special case where the collection has a single record whose ID is `isSingle` (a constant symbol)
 * in which only one record exists in the collection.
 */
export default class CollectionClass {
    tree: Tree;
    config: CollectionDef;
    constructor(tree: Tree, config: CollectionDef, records?: Data[]);
    get values(): RecordMap;
    private _fieldMap?;
    get fieldMap(): Map<string, RecordFieldSchema>;
    private _validateConfig;
    get name(): string;
    subject: BehaviorSubject<any>;
    validate(value: Data): void;
    identityOf(value: Data): unknown;
    /**
     * this is an "inner put" that (will be) triggering transactional backups
     */
    setValue(value: Data): unknown;
    put(value: Data): void;
    get(id: any): any;
    query(query: Partial<QueryDef>): import("rxjs").Observable<import("./types").LeafObj<any>[]>;
    private _fetch;
    has(identity: any): boolean;
    fetch(query: Partial<QueryDef>): import("./types").LeafObj<any>[];
}
export {};
