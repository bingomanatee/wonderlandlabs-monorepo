import { Observable, Observer, SubjectLike, Subscription } from 'rxjs';
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums';
import CollectionClass from './CollectionClass';
import { type, TypeEnum } from '@wonderlandlabs/walrus';

export type LeafId = string;

export type TransAction = (tree: TreeIF) => void;

export type LeafObjJSONJoins = Record<string, LeafObjJSON<any>[]>;

export type LeafObjJSON<ValueType> = {
  value: ValueType | undefined,
  collection: string,
  identity: any,
  joins?: LeafObjJSONJoins
}

function isNonEmptyString(a: unknown): a is string {
  return !!((typeof a === 'string') && a);
}

export function isLeafJSON(a: unknown): a is LeafObjJSON<any> {
  return !!(a && typeof a === 'object') && ('collection' in a && isNonEmptyString(a.collection)) &&
    ('identity' in a);
}

export type LeafObjJSONAbsent = {
  collection: string,
  identity: any,
  $exists: false,
  joins: LeafObjJSONJoins
}

export interface LeafObj<ValueType> {
  $value: ValueType
  $identity: any,
  $collection: string,

  toJSON(): LeafObjJSON<ValueType> | LeafObjJSONAbsent

  $subscribe(observer: Observer<LeafObj<ValueType>>): Subscription;
}

export type UpdateMsg = {
  action: string,
  collection?: string,
  identity?: any,
  value?: any,
}

export type UpdatePutMsg = UpdateMsg & {
  action: 'put-data',
  collection: string,
  identity: any,
  prev: Data | undefined
}

export type DoProps = {
  name?: string,
  args?: any[]
}

export interface TransManagerIF {
  tree: TreeIF,

  start(props?: DoProps): TransHandlerIF;

  remove(index: number, success: boolean): void;
}

export interface TransHandlerIF {

  id: number,

  complete(): void;

  fail(err: Error): void;
}

export interface TreeIF {

  put(collection: string, value: Data): void;

  get(collection: string, id: any): any;

  has(collection: string, id: any):  boolean;

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

  /**
   * updates is a generic 'pipe' for observing all sorts of change
   * in a tree across all collections.
   * It drives the transaction/fallback mechanic
   * and allows for observation of any activity in the entire tree.
   */

  revert(handlers: TransHandlerIF[]): void;
}

type ValidatorFn = (value: any, collection?: CollectionClass) => any

type MutableType = TypeEnumType | TypeEnumType[]

export type BaseRecordFieldSchema = {
  type?: MutableType,
  validator?: ValidatorFn
  optional?: boolean,
  defaultValue?: any,
  keyType?: MutableType
  valueType?: MutableType
}

export type RecordFieldSchema = {
  name: string,
} & BaseRecordFieldSchema

type IDFactory = (value: Data, collection?: CollectionClass) => unknown
export type Identity = string | IDFactory;
type FieldDefObject = Record<string, BaseRecordFieldSchema | TypeEnumType>

export type CollectionTestFn = (record: unknown) => boolean

export type CollectionDef = {
  name: string,
  identity: Identity
  fields: RecordFieldSchema[] | FieldDefObject
  records?: Data[]
  test?: CollectionTestFn
}

// the general pattern of any data stored in a collection
export type Data = Record<string, unknown>

export type JoinSchema = {
  name: string,

  from: string,
  fromField?: string

  to: string,
  toField?: string

  dynamic?: boolean // join in-memory with generated "join" collection
}


export type JoinObj = {
  joins?: QueryDefJoin[]
}

export function isJoinObj(join: any): join is JoinObj {
  if (!(type.describe(join, true) === TypeEnum.object)) {
    return false;
  }
  if (join.joins) {
    return Array.isArray(join.joins);
  }
  return true;
}

export type QueryDef = {
  collection: string,
  identity?: any,
} & JoinObj;

export type CompFn = (leaf1: LeafObj<any>, leaf2: LeafObj<any>) => number;

type QueryNamedDefJoin = {
  name: string,
  sorter?: SortDef
} & JoinObj

export function isQueryNamedDefJoin(join: any): join is QueryNamedDefJoin {
  return (type.describe(join, true) === TypeEnum.object) && (
    ('name' in join) && (typeof join.name === 'string')
    && (isJoinObj(join))
  );
}

type SortDef = CompFn | string | string[]

type QueryCollectionDefJoin = {
  collection: string,
  sorter?: SortDef
} & JoinObj

export function isQueryCollectionDefJoin(join: any): join is QueryNamedDefJoin {
  return (type.describe(join, true) === TypeEnum.object) && (
    ('collection' in join) && (typeof join.collection === 'string')
    && (isJoinObj(join))
  );
}

export function isQueryDefJoin(join: any): join is QueryDefJoin {
  return isQueryNamedDefJoin(join) || isQueryCollectionDefJoin(join);
}

export type QueryDefJoin = (QueryNamedDefJoin | QueryCollectionDefJoin);
