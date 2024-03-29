import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import { QueryDef } from './types.query-and-join';
import { Observable } from 'rxjs';
import { LeafObj } from './types.leaf';
export type DataID = string | number;
export type Data = Record<string, unknown>;
export interface CollectionIF {
    get(id: DataID): Data | undefined;
    name: string;
    put(value: Data): DataID;
    has(id: DataID): boolean;
    query(query: Partial<QueryDef>): Observable<LeafObj<any>[]>;
    fetch(query: Partial<QueryDef>): LeafObj<any>[];
    values: Map<DataID, Data>;
}
export type DataIsValid = (data: Data, coll: CollectionIF) => void;
type ValidatorFn = (value: any, collection?: CollectionIF) => any;
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
type IDFactory = (value: Data, collection?: CollectionIF) => DataID;
export type IdentityDefinition = string | IDFactory;
type FieldDefObject = Record<string, BaseRecordFieldSchema | TypeEnumType>;
export type CollectionTestFn = (record: unknown) => boolean;
export type CollectionDef = {
    name: string;
    identity: IdentityDefinition;
    fields: RecordFieldSchema[] | FieldDefObject;
    records?: Data[];
    test?: CollectionTestFn;
};
export type RecordMap = Map<DataID, Data>;
export {};
