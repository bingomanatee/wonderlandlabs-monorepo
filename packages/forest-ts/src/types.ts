import { Observable, Observer, SubjectLike, Subscription } from 'rxjs'
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums'
import CollectionClass from './CollectionClass'

export type LeafId = string;

export type TransAction = (tree: Tree) => void;

export type LeafObjJSONJoins = Record<string, LeafObjJSON<any>[]>;

export type LeafObjJSON<ValueType> = {
  value: ValueType,
  collection: string,
  identity: any,
  joins: LeafObjJSONJoins
}

export interface LeafObj<ValueType> {
  $value: ValueType
  $identity: any,
  toJSON(): LeafObjJSON<ValueType>
  $subscribe(observer: Observer<LeafObj<ValueType>>) : Subscription;
}

export type UpdateMsg = {
  action: string,
  collection: string,
  identity?: any,
  value?: any,
}

export interface Tree {
  put(collection: string, value: LeafRecord): void
  get(collection: string, id: any): any
  do(action: TransAction) : void
  collection(name: string): CollectionClass
  query(query: QueryDef) : Observable<LeafObj<any>[]>
  fetch(query: QueryDef) : any
  leaf(collection: string, id: any, joins: JoinObj) : LeafObj<any>
  joins: Map<string, JoinSchema>,
  updates: SubjectLike<UpdateMsg>
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

export type JoinExpression = {
  name: string,
  form: TypeEnumType
}

type IDFactory = (value: LeafRecord, collection?: CollectionClass) => any
export type Identity = string | IDFactory;
type FieldDefObject = Record<string, BaseRecordFieldSchema | TypeEnumType>

export type CollectionDef = {
  name: string,
  identity: Identity
  fields: RecordFieldSchema[] | FieldDefObject
  joins?: JoinExpression[],
  values?: any[]
}

export type LeafRecord = Record<string, any>

/*
export type RecordSchema = {
  name: string,
  typescriptName?: string
  identity: string | LeafSelectorFn
  fields?: RecordFieldSchema[]
  joins?: JoinExpression[]
} & BaseRecordFieldSchema
*/

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

export type QueryDef = {
  collection: string,
  identity?: any,
} & JoinObj;

export type QueryDefJoin = {
  name: string,
} & JoinObj;
