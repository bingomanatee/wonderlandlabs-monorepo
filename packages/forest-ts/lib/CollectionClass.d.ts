import { CollectionDef, LeafRecord, QueryDef, RecordFieldSchema, Tree } from './types';
import { BehaviorSubject } from 'rxjs';
/**
 * This is a bundle of records with the same fields.
 * There is a special case where the collection has a single record whose ID is `isSingle` (a constant symbol)
 * in which only one record exists in the collection.
 */
export default class CollectionClass {
    tree: Tree;
    config: CollectionDef;
    constructor(tree: Tree, config: CollectionDef, records?: LeafRecord[]);
    get values(): any;
    private _fieldMap?;
    get fieldMap(): Map<string, RecordFieldSchema>;
    private _validateConfig;
    get name(): string;
    subject: BehaviorSubject<any>;
    validate(value: LeafRecord): void;
    identityOf(value: LeafRecord): any;
    /**
     * this is an "inner put" that (will be) triggering transactional backups
     */
    setValue(value: LeafRecord): any;
    put(value: LeafRecord): void;
    get(id: any): any;
    query(query: Partial<QueryDef>): import("rxjs").Observable<import("./types").LeafObj<any>[]>;
    private _fetch;
    has(identity: any): any;
    fetch(query: Partial<QueryDef>): import("./types").LeafObj<any>[];
}
