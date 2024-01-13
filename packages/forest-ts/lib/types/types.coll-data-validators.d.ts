import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import { QueryDef } from './types.query-and-join';
import { Observable } from 'rxjs';
import { LeafObj } from './types.leaf';
import { UpdatePutMsg } from './types.tree-and-trans';
export type DataID = string | number | symbol;
export type Data = Record<string, unknown>;
export declare function isData(def: unknown): def is Data;
export interface CollectionIF {
    get(id: DataID): Data | undefined;
    name: string;
    put(value: Data): DataID;
    has(id: DataID): boolean;
    query(query: Partial<QueryDef>): Observable<LeafObj[]>;
    fetch(query: Partial<QueryDef>): LeafObj[];
    values: Map<DataID, Data>;
    unPut(p: UpdatePutMsg): void;
    finishRevert(): void;
}
export type DataValidatorFn = (data: Data, coll: CollectionIF) => void;
export declare function isDataValidatorFn(def: unknown): def is DataValidatorFn;
type ValidatorFn = (value: unknown, collection?: CollectionIF) => unknown;
type FieldTypeOrTypes = TypeEnumType | TypeEnumType[];
export type BaseRecordFieldSchema = {
    type?: FieldTypeOrTypes;
    validator?: ValidatorFn;
    optional?: boolean;
    defaultValue?: unknown;
    keyType?: FieldTypeOrTypes;
    valueType?: FieldTypeOrTypes;
};
/**
 * Although there is a wide variety of fields in a potential schema field def,
 * to be meaningful it must either have a single field type or a validator function.
 */
export declare function isBaseRecordFieldSchema(def: unknown): boolean;
export type RecordFieldSchema = {
    name: string;
} & BaseRecordFieldSchema;
type IDFactory = (value: Data, collection?: CollectionIF) => DataID;
export type IdentityDefinition = string | IDFactory;
export type FieldDef = BaseRecordFieldSchema | TypeEnumType | string;
export declare function isRecordFieldSchema(def: unknown): def is RecordFieldSchema;
export type FieldDefObj = Record<string, FieldDef>;
export declare function isFieldDefObj(def: unknown): def is FieldDefObj;
export type CollectionTestFn = (record: unknown) => boolean;
export type CollectionDef = {
    name: string;
    identity: IdentityDefinition;
    schema?: unknown;
    records?: Data[];
    test?: CollectionTestFn;
};
export type RecordMap = Map<DataID, Data>;
export {};
