import { CompFn } from "./types.leaf";
export declare function isNonEmptyString(a: unknown): a is string;
export type JoinSchema = {
  name: string;
  from: string;
  fromField?: string;
  to: string;
  toField?: string;
  dynamic?: boolean;
};
export type JoinObj = {
  joins?: QueryDefJoin[];
};
export declare function isJoinObj(join: any): join is JoinObj;
export type QueryDef = {
  collection: string;
  identity?: any;
} & JoinObj;
type QueryNamedDefJoin = {
  name: string;
  sorter?: SortDef;
} & JoinObj;
export declare function isQueryNamedDefJoin(
  join: any,
): join is QueryNamedDefJoin;
type SortDef = CompFn | string | string[];
type QueryCollectionDefJoin = {
  collection: string;
  sorter?: SortDef;
} & JoinObj;
export declare function isQueryCollectionDefJoin(
  join: any,
): join is QueryNamedDefJoin;
export declare function isQueryDefJoin(join: any): join is QueryDefJoin;
export type QueryDefJoin = QueryNamedDefJoin | QueryCollectionDefJoin;
export {};
