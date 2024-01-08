import { CollectionDef, Data, DataID, DataIsValid, QueryDef, RecordMap, RecordFieldSchema, TreeIF } from './types';
import { BehaviorSubject } from 'rxjs';
import { CollectionIF } from './types';
/**
 * This is a bundle of records with the same fields.
 * There is a special case where the collection has a single record whose ID is `isSingle` (a constant symbol)
 * in which only one record exists in the collection.
 */
export default class CollectionClass implements CollectionIF {
    tree: TreeIF;
    config: CollectionDef;
    constructor(tree: TreeIF, config: CollectionDef, records?: Data[]);
    get values(): RecordMap;
    private _fieldMap?;
    get fieldMap(): Map<string, RecordFieldSchema>;
    private _validateConfig;
    get name(): string;
    subject: BehaviorSubject<any>;
    validate(value: Data): void;
    private dataValidators;
    addValidator(div: DataIsValid): void;
    identityOf(value: Data): DataID;
    /**
     * this is an "inner put" that (will be) triggering transactional backups
     */
    setValue(value: Data): DataID;
    put(value: Data): DataID;
    get(id: DataID): Data | undefined;
    query(query: Partial<QueryDef>): import("rxjs").Observable<import("./types").LeafObj[]>;
    private _fetch;
    has(identity: DataID): boolean;
    fetch(query: Partial<QueryDef>): import("./types").LeafObj[];
}
