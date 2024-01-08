import { type, TypeEnum } from '@wonderlandlabs/walrus';

import { CompFn } from './types.leaf';

export function isNonEmptyString(a: unknown): a is string {
  return !!((typeof a === 'string') && a);
}

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