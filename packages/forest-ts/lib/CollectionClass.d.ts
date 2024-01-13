import { CollectionDef, Data, DataID, DataValidatorFn, QueryDef, RecordMap, TreeIF, UpdatePutMsg } from './types';
import { BehaviorSubject } from 'rxjs';
import { CollectionIF } from './types';
/**
 * This is a bundle of records with the same fields.
 * There is a special case where the collection has a single record whose ID is `SINGLE` (a constant symbol)
 * in which only one record exists in the collection.
 */
export default class CollectionClass implements CollectionIF {
    tree: TreeIF;
    config: CollectionDef;
    constructor(tree: TreeIF, config: CollectionDef, records?: Data[]);
    unPut(p: UpdatePutMsg): void;
    private _revertedValues?;
    private get revertedValues();
    finishRevert(): void;
    private _validateConfig;
    get name(): string;
    get values(): RecordMap;
    subject: BehaviorSubject<any>;
    private _schemaValidator?;
    private schemaValidator;
    /**
     * field and dataValidators throw when they detect an error.
     * @param value
     */
    validate(value: Data): void;
    private dataValidators;
    addValidator(div: DataValidatorFn): void;
    removeValidator(div: DataValidatorFn): void;
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
