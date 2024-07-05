import { Observer, Subscription } from "rxjs";
import { Data, DataID } from "./types.coll-data-validators";
export type LeafObjJSONJoins = Record<string, LeafObjJSON<any>[]>;
export type LeafObjJSON<ValueType> = {
  value: ValueType | undefined;
  collection: string;
  identity: any;
  joins?: LeafObjJSONJoins;
};
export declare function isLeafJSON(a: unknown): a is LeafObjJSON<any>;
export type LeafObjJSONAbsent = {
  collection: string;
  identity: DataID;
  $exists: false;
  joins: LeafObjJSONJoins;
};
export interface LeafObj<ValueType> {
  $value: Data;
  $identity: DataID;
  $collection: string;
  toJSON(): LeafObjJSON<ValueType> | LeafObjJSONAbsent;
  $subscribe(observer: Observer<LeafObj<ValueType>>): Subscription;
}
export type CompFn = (leaf1: LeafObj<any>, leaf2: LeafObj<any>) => number;
