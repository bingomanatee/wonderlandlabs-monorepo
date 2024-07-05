import { Observer, Subscription } from "rxjs";
import { Data, DataID } from "./types.coll-data-validators";
export type LeafObjJSONJoins = Record<string, LeafObjJSON[]>;
export type LeafObjJSONAbsent = {
  collection: string;
  identity: DataID;
  $exists: boolean;
};
export type LeafObjJSON = {
  value: Data;
  collection: string;
  identity: DataID;
  joins?: LeafObjJSONJoins;
};
export declare function isLeafJSON(a: unknown): a is LeafObjJSON;
export interface LeafObj {
  $value: Data;
  $identity: DataID;
  $collection: string;
  toJSON(): LeafObjJSON | LeafObjJSONAbsent;
  $subscribe(observer: Observer<LeafObj>): Subscription;
}
export type CompFn = (leaf1: LeafObj, leaf2: LeafObj) => number;
