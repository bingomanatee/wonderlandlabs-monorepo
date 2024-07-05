import CollectionClass from "./CollectionClass";
import { QueryDef, RecordFieldSchema, DataID, Data } from "./types";
export declare function compareMaps(
  map1: Map<DataID, Data>,
  map2: Map<DataID, Data>,
  query: QueryDef,
): boolean;
export declare function validateField(
  value: Data,
  def: RecordFieldSchema,
  coll: CollectionClass,
): void;
export declare function idStr(id: DataID): string;
