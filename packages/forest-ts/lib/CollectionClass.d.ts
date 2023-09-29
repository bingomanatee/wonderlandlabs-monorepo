import { CollectionDef, LeafRecord, QueryDef, RecordFieldSchema, Tree } from './types';
import { BehaviorSubject } from 'rxjs';
export default class CollectionClass {
    tree: Tree;
    config: CollectionDef;
    values: Map<any, any>;
    constructor(tree: Tree, config: CollectionDef, values?: any[]);
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
    fetch(query: QueryDef): undefined;
}
