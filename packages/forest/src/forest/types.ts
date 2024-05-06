export type TableName = string;

/**
 * Vocabulary note:
 *
 * Table identified by `name`.
 * Tables are maps of Records identified by `id`. (Type TableId)
 *
 * If a Table has ContainerRecords (dictionary of key/value)
 * they are collection of `fields` with `values`.  (Type TableField)
 */

/**
 * All the code in Forest stored data in Records (Type) collections - maps of id and value.
 * Tables are a decorator of this map that include other properties.
 *
 */
export interface TableIF<RecordIdentity = Scalar, RecordValue = unknown> {
  name: TableName;

  get(id: RecordIdentity): RecordValue; // throws if there is no value.
  set(id: RecordIdentity, value: RecordValue): void;

  has(id: RecordIdentity): boolean;

  delete(key: RecordIdentity): boolean; // returns true if it existed
  current: Records<RecordIdentity, RecordValue>;
  stack: Records<RecordIdentity, RecordValue>[];
  currentIndex: number;

  atTime(index: number): void;

  change(change: TableChange): void;
}

/**
 * a collection of values either stored in a table or defined in a change.
 * Note - no assumption is made by the system that a record is ANY sort of structure; it can be a binary blob,
 * a map, POJO , array ... the only requirement is that it is uniquely defined by its key.
 */
export type Records<TableKey = Scalar, TableValue = unknown> = Map<
  TableKey,
  TableValue
>;

/**
 * For what is probably the vast majority of the cases, Records are structured data (POJO or Maps)
 * with fields(properties) and values.
 */
/**
 export type TableFieldSet = Map<TableField, unknown>;
 * TableRecordField map is a two level map for zero or more tables,
 * it has field/value pairs for multiple record in the table: that is:
 *
 *  tableAlpha
 *       recordId1
 *          field1: value1
 *          field2: value2
 *          field3: value3
 *     recordId2
 *         field1: value1
 *         field2: value2...
 *
 * tableBeta
 *     recordId1
 *         field1: value1
 *         field2: value2 ...
 *    recordId2...
 */
export type TableRecordFieldMap<TableID = Scalar, TableValue = unknown> = Map<
  TableID,
  TableValue
>;

export const CrudEnum = {
  CRUD_ADD: 'CRUD_ADD',
  CRUD_CHANGE: 'CRUD_CHANGE',
  //CRUD_UPSERT: 'CRUD_UPSERT',
  // CRUD_DEFINE: 'CRUD_DEFINE',
  CRUD_DELETE: 'CRUD_DELETE',
};

type CrudEnumKeys = keyof typeof CrudEnum;

export type CRUD = typeof CrudEnum[CrudEnumKeys];
export type Scalar = string | symbol | number; // the index of a value in a table
export type TableField = Scalar; // a field of the table's values

/** this is a simple value change.
 * note the action will change how the action performs:
 *
 * CRUD_ADD will only add properties if they DO NOT ALREADY EXIST
 * CRUD_CHANGE will only change properties THAT ALREADY EXIST
 * CRUD_DEFINE is exclusive - it replaces ALL data with its content
 * CURD_UPSERT will set properties REGARDLESS of their presence in the existing record (what you want usually)
 * CRUD_DELETE will REMOVE properties for the defined field(s)
 *
 * The value is ignored for CRUD_DELETE operations
 *
 * CRUD_DEFINE is a dangerously powerful reset - for instance
 * a ForestChange of type CRUD_DEFINE would replace all the data
 * in ALL the tables it describes with ONLY the data in its map.
 */

/**
 * TableChangeBase is the basis for any table change; each of these are constrained to changing
 * a single Tables values.
 */
export type TableChangeBase = {
  table: TableName;
  action: CRUD;
};
/**
 * surgically changes (or deletes) a single field of a single record
 */
export type TableChangeField = {
  id: Scalar;
  field: TableField;
  value: unknown;
} & TableChangeBase;

/**
 * completely changes (or deletes) a record;
 */
export type TableChangeValue = {
  id: Scalar;
  value: unknown;
} & TableChangeBase;
/*
* changes multiple fields in multiple records in one tables
*
export type TableChangeMultiValue = {
table: TableName;
change: Records;
};
*/

/**
 * This is an open-ended functional pipe for dynamic operations:
 * the forests' tables are selected by the table name(s), passed to map.
 * map outputs a subset of values from those tables.
 * reduce takes the table -> key ->value nested map and transforms into an unknown summation
 * change returns zero or more operations to perform based on the data from reduce.
 *
 * note - change could be a hook to some external function/operation that returns an empty array
 * but performs some other impure operation. (i.e., a "callback")
 */
/*
type MultiTableValues = Map<TableName, TableRecordMap<unknown, unknown>>; // a map of one or more tables' values.
export type TableOperation = {
  table: TableName | TableName[];
  map: (
    tables: TableIF<unknown, unknown>[],
    forest: ForestIF
  ) => MultiTableValues;
  reduce?: (mtv: MultiTableValues, forest: ForestIF) => unknown;
  change?: (reduceResult: unknown, forest: ForestIF) => DataChangeItem[];
};
*/

export type TableChange = TableChangeField | TableChangeValue;
// | TableChangeMultiField  | TableOperation;

// create, bulk update, or destroy table
export type MultiTableChange = {
  action: CRUD;
  tableChanges: TableRecordFieldMap;
};

export type ChangeItem = TableChange | MultiTableChange;

export interface DataChange {
  time: number;
  changes: ChangeItem[];
}

/**
 * the "DATABASE" - includes external tables and "journal tables" that track and validate changes
 */
export interface ForestIF {
  tables: Map<TableName, TableIF>;

  has(name: TableName): boolean;

  addTable(name: TableName, values: Map<unknown, unknown>): TableIF;

  change(changes: ChangeItem[]): boolean;

  log: DataChange[];
}
