import { TypeEnumType } from "@wonderlandlabs/walrus/dist/enums";
import { type, TypeEnum } from "@wonderlandlabs/walrus";
import { QueryDef } from "./types.query-and-join";
import { Observable } from "rxjs";
import { LeafObj } from "./types.leaf";
import { UpdatePutMsg } from "./types.tree-and-trans";

export type DataID = string | number | symbol;
export type Data = Record<string, unknown>;

function isObj(def: unknown): def is Record<string, unknown> {
  return type.describe(def, true) === TypeEnum.object;
}

export function isData(def: unknown): def is Data {
  if (!isObj(def)) {
    return false;
  }
  return true;
}

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

// expected to throw if data is not valid
export type DataValidatorFn = (data: Data, coll: CollectionIF) => void;

export function isDataValidatorFn(def: unknown): def is DataValidatorFn {
  return typeof def === "function";
}

type ValidatorFn = (value: unknown, collection?: CollectionIF) => unknown;
// the return value is ignored; the only purpose of these functions is to throw on bad data

type FieldTypeOrTypes = TypeEnumType | TypeEnumType[];
export type BaseRecordFieldSchema = {
  type?: FieldTypeOrTypes;
  validator?: ValidatorFn;
  optional?: boolean;
  defaultValue?: unknown;
  keyType?: FieldTypeOrTypes;
  valueType?: FieldTypeOrTypes;
};

function isTypeEnumDef(def: unknown): def is typeof TypeEnum {
  return typeof def === "string" && def in TypeEnum;
}

/**
 * Although there is a wide variety of fields in a potential schema field def,
 * to be meaningful it must either have a single field type or a validator function.
 */
export function isBaseRecordFieldSchema(def: unknown) {
  if (!isObj(def)) {
    return false;
  }
  if (!("type" in def || "validator" in def)) {
    return false;
  }
  if ("type" in def) {
    if (!isTypeEnumDef(def.type)) {
      console.log("---- bad isTypeEnumDef type:", def.type);
      return false;
    }
  }
  if ("validator" in def) {
    if (!isDataValidatorFn(def.validator)) {
      return false;
    }
  }
  return true;
}

export type RecordFieldSchema = {
  name: string;
} & BaseRecordFieldSchema;
type IDFactory = (value: Data, collection?: CollectionIF) => DataID;
export type IdentityDefinition = string | IDFactory;

export type FieldDef = BaseRecordFieldSchema | TypeEnumType | string;

export function isRecordFieldSchema(def: unknown): def is RecordFieldSchema {
  if (!isObj(def)) {
    return false;
  }
  if (!(def.name && typeof def.name === "string")) {
    return false;
  }
  return isBaseRecordFieldSchema(def);
}

function isFieldDef(def: unknown): def is FieldDef {
  if (!def) {
    return false;
  }
  if (typeof def === "string") {
    return isTypeEnumDef(def);
  }

  if (isBaseRecordFieldSchema(def)) {
    return true;
  }
  return false;
}

export type FieldDefObj = Record<string, FieldDef>;

export function isFieldDefObj(def: unknown): def is FieldDefObj {
  if (!(type.describe(def, true) === TypeEnum.object)) {
    return false;
  }
  const defObj = def as Record<string, unknown>;
  for (const key of Object.keys(defObj as Record<string, unknown>)) {
    const fDef = defObj[key];
    if (!isFieldDef(fDef)) {
      return false;
    }
  }
  return true;
}

export type CollectionTestFn = (record: unknown) => boolean;
export type CollectionDef = {
  name: string;
  identity: IdentityDefinition;
  schema?: unknown;
  records?: Data[];
  test?: CollectionTestFn;
};
export type RecordMap = Map<DataID, Data>;
