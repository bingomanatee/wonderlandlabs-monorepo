import { Observable, Observer, Subject, Subscription } from 'rxjs'
import { TypeEnumType } from '@wonderlandlabs/walrus/dist/enums'
import { IDENTITY, SINGLE } from './constants'
import CollectionClass from './CollectionClass'

export type LeafId = string;

export type TransAction = (tree: Tree) => void;

export interface LeafObj<ValueType> {
  $value: ValueType
  $identity: any,
  $subscribe(observer: Observer<LeafObj<ValueType>>) : Subscription;
}

export interface Tree {
  put(collection: string, value: LeafRecord): void
  get(collection: string, id: any): any
  do(action: TransAction) : void
  collection(name: string): CollectionClass
  query(query: QueryDef) : Observable<LeafObj<any>[]>
  fetch(query: QueryDef) : any
  leaf(collection: string, id: any) : LeafObj<any>
}

type ValidatorFn = (value: any, collection?: CollectionClass) => any

type MutableType = TypeEnumType | TypeEnumType[]

export type ValueSchema = {
  type?: MutableType,
  validator?: ValidatorFn
  optional?: boolean,
  defaultValue?: any,
  keyType?: MutableType
  valueType?: MutableType
}

export type RecordFieldSchema = {
  name: string,
} & ValueSchema

export type JoinExpression = {
  name: string,
  form: TypeEnumType
}

export type Identity = string | ((value: LeafRecord, collection?: CollectionClass) => any) | typeof SINGLE;

export type CollectionDef = {
  name: string,
  identity: Identity
  fields: RecordFieldSchema[]
  joins?: JoinExpression[]
}

export type LeafRecord = Record<string, any>

/*
export type RecordSchema = {
  name: string,
  typescriptName?: string
  identity: string | LeafSelectorFn
  fields?: RecordFieldSchema[]
  joins?: JoinExpression[]
} & ValueSchema
*/

export type JoinSchema = {
  name: string,

  fromCollection: string,
  fromField?: string | typeof IDENTITY

  toCollection: string,
  toField?: string | typeof IDENTITY

  dynamic?: boolean // join in-memory with generated "join" collection
}

export type QueryDefJoin = {
  name: string,
  fields?: string[],
  joins?: QueryDefJoin[]
}

export type QueryDef = {
  collection: string,
  identity?: any,
  fields?: string[],
  joins?: QueryDefJoin[]
}
