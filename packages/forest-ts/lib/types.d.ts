import { Observable, Observer, SubjectLike, Subscription } from 'rxjs';
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import CollectionClass from './CollectionClass';
export type LeafId = string;
export type TransAction = (tree: Tree) => void;
export type LeafObjJSONJoins = Record<string, LeafObjJSON<any>[]>;
export type LeafObjJSON<ValueType> = {
    value: ValueType | undefined;
    collection: string;
    identity: any;
    joins?: LeafObjJSONJoins;
};
export declare function isLeafJSON(a: unknown): a is LeafObjJSON<any>;
export type LeafObjJSONAbsent = {
    collection: string;
    identity: any;
    $exists: false;
    joins: LeafObjJSONJoins;
};
export interface LeafObj<ValueType> {
    $value: ValueType;
    $identity: any;
    $collection: string;
    toJSON(): LeafObjJSON<ValueType> | LeafObjJSONAbsent;
    $subscribe(observer: Observer<LeafObj<ValueType>>): Subscription;
}
export type UpdateMsg = {
    action: string;
    collection: string;
    identity?: any;
    value?: any;
};
export interface Tree {
    put(collection: string, value: Data): void;
    get(collection: string, id: any): any;
    do(action: TransAction): void;
    collection(name: string): CollectionClass;
    query(query: QueryDef): Observable<LeafObj<any>[]>;
    fetch(query: QueryDef): any;
    leaf(collection: string, id: any, joins: QueryDefJoin): LeafObj<any>;
    joins: Map<string, JoinSchema>;
    /**
     * The specification of relationships between two collections.
     */
    updates: SubjectLike<UpdateMsg>;
}
type ValidatorFn = (value: any, collection?: CollectionClass) => any;
type MutableType = TypeEnumType | TypeEnumType[];
export type BaseRecordFieldSchema = {
    type?: MutableType;
    validator?: ValidatorFn;
    optional?: boolean;
    defaultValue?: any;
    keyType?: MutableType;
    valueType?: MutableType;
};
export type RecordFieldSchema = {
    name: string;
} & BaseRecordFieldSchema;
type IDFactory = (value: Data, collection?: CollectionClass) => unknown;
export type Identity = string | IDFactory;
type FieldDefObject = Record<string, BaseRecordFieldSchema | TypeEnumType>;
export type CollectionTestFn = (record: unknown) => boolean;
export type CollectionDef = {
    name: string;
    identity: Identity;
    fields: RecordFieldSchema[] | FieldDefObject;
    records?: Data[];
    test?: CollectionTestFn;
};
export type Data = Record<string, unknown>;
export type JoinSchema = {
    name: string;
    from: string;
    fromField?: string;
    to: string;
    toField?: string;
    dynamic?: boolean;
};
export type JoinObj = {
    joins?: QueryDefJoin[];
};
export declare function isJoinObj(join: any): join is JoinObj;
export type QueryDef = {
    collection: string;
    identity?: any;
} & JoinObj;
export type CompFn = (leaf1: LeafObj<any>, leaf2: LeafObj<any>) => number;
type QueryNamedDefJoin = {
    name: string;
    sorter?: SortDef;
} & JoinObj;
export declare function isQueryNamedDefJoin(join: any): join is QueryNamedDefJoin;
type SortDef = CompFn | string | string[];
type QueryCollectionDefJoin = {
    collection: string;
    sorter?: SortDef;
} & JoinObj;
export declare function isQueryCollectionDefJoin(join: any): join is QueryNamedDefJoin;
export declare function isQueryDefJoin(join: any): join is QueryDefJoin;
export type QueryDefJoin = (QueryNamedDefJoin | QueryCollectionDefJoin);
export {};
