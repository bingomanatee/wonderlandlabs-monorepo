import { Observable, SubjectLike } from 'rxjs';
import { Data } from '../types';
import { JoinSchema, QueryDef, QueryDefJoin } from './types.query-and-join';
import { LeafObj } from './types.leaf';
import { CollectionIF, DataID, DataValidatorFn } from './types.coll-data-validators';

export type DoProps = {
  name?: string,
  args?: unknown[]
}

export interface TransManagerIF {
  tree: TreeIF,

  start(props?: DoProps): TransHandlerIF;

  remove(index: number, success: boolean): void;
}

export interface TransHandlerIF {

  id: number,

  complete(): void;

  fail(): void;

  puts: UpdatePutMsg[]
}

export type UpdateMsg = {
  action: string,
  collection?: string,
  identity?: DataID,
  value?: unknown,
}
export type UpdatePutMsg = UpdateMsg & {
  action: 'put-data',
  collection: string,
  identity: DataID,
  create: boolean,
  prev: Data | undefined
}

export type TransAction = (tree: TreeIF, ...rest: unknown[]) => unknown;

export interface TreeIF {

  put(collection: string, value: Data): void;

  get(collection: string, id: any): any;

  has(collection: string, id: any): boolean;

  do(action: TransAction): unknown;

  collection(name: string): CollectionIF;

  query(query: QueryDef): Observable<LeafObj[]>;

  fetch(query: QueryDef): any;

  leaf(collection: string, id: any, joins: QueryDefJoin): LeafObj;

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

  createSchemaValidator(definition: unknown, collection: CollectionIF) : DataValidatorFn | void
}