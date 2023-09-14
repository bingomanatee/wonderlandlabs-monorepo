import { BehaviorSubject } from 'rxjs'
import { Schema } from './Schema'
import { FormEnum, TypeEnum } from '@wonderlandlabs/walrus/dist/enums'
import { type } from '@wonderlandlabs/walrus'

export type LeafId = string;

export interface LeafObj<ValueType> {
  $value: ValueType
  $id: string
  $subject: BehaviorSubject<ValueType>
  $composedSubject: BehaviorSubject<ValueType>
  $child(key: any): LeafObj<any> | undefined
  $children?: Map<any, LeafObj<any>>
  $options: SchemaProps
  $tree: Tree
  $complete(): void
  $blockUpdateToChildren: boolean
  $blockUpdateToParent: boolean
  $parent?: LeafObj<any>
  $parentField?: any
}

export type LeafOpts = {
  name?: string,
  fields?: Schema[]
}

export type SchemaRecord = Record<string, SchemaPropsInput>;

export interface Tree {
  addLeaf(leaf: LeafObj<any>): void
  value(id: LeafId): any
  update(id: LeafId, value: any): void
}

type ValidatorFn = (value: any) => any
export type SchemaProps = {
  notes?: string
  $type: TypeEnum | 'any'
  key?: any,
  valueType?: TypeEnum
  keyType?: TypeEnum
  test?: ValidatorFn
  defaultValue?: any,
  fields?: SchemaTupleList | SchemaRecord
} & (
  { name: string, typescriptName?: string }
  |
  { typescriptName: string, name: string }
  )

export type SchemaTuple = {
  schema: SchemaProps,
  name: any,
  value?: any
}


export type SchemaTupleList = SchemaTuple[];

export function isSchemaTuple(arg: any) : arg is SchemaTuple {
  return arg && typeof arg === 'object' && 'name' in arg && isSchema(arg.schema);
}

export function isSchemaTupleList(arg: any) : arg is SchemaTupleList {
  return arg && Array.isArray(arg) && arg.every(isSchemaTuple);
}

export function isSchemaRecord(arg: any) : arg is SchemaRecord {
  return arg && !Array.isArray(arg) && (typeof arg === 'object')
    && Array.from(Object.values(arg)).every(isSchema);
}

export function isSchemaProps(arg: any): arg is SchemaProps {
  return type.describe(arg, 'form') === FormEnum.object && '$type' in arg;
}

export function isSchema(arg: any): arg is Schema {
  return arg && typeof arg === 'object' && '$type' in arg
}
