export const FormEnum = {
  scalar: "scalar",
  array: "array",
  map: "map",
  object: "object",
  set: "set",
  function: "function",
  container: "container",
  void: "void",
};

type FormEnumKeys = keyof typeof FormEnum;
export type FormEnumType = (typeof FormEnum)[FormEnumKeys];

export const TypeofEnum = {
  undefined: "undefined",
  object: "object",
  boolean: "boolean",
  number: "number",
  bigint: "bigint",
  string: "string",
  symbol: "symbol",
  function: "function",
};

export const NumberEnum = {
  infinite: "infinite",
  nan: "nan",
  integer: "integer",
  decimal: "decimal",
};

type NumberEnumKeys = keyof typeof NumberEnum;
export type NumberEnumType = (typeof NumberEnum)[NumberEnumKeys];

export const TypeEnum = {
  string: "string",
  number: "number",
  boolean: "boolean",
  symbol: "symbol",
  array: "array",
  map: "map",
  object: "object",
  set: "set",
  null: "null",
  undefined: "undefined",
  function: "function",
};

type TypeEnumKeys = keyof typeof TypeEnum;
export type TypeEnumType = (typeof TypeEnum)[TypeEnumKeys];
