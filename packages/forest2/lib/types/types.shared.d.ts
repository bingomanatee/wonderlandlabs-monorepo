import type { MutatorFn as MutatorFn } from "./types.branch";
/**
 * a "literal replacement value"
 */
export interface Assertion<ValueType> {
    assert: ValueType;
    name: string;
    time?: number;
}
/**
 * a "dynamic mutator" that computes off the previous branch
 */
export interface Mutator<ValueType> {
    mutator: MutatorFn<ValueType>;
    seed?: any;
    name: string;
}
/**
 * a change is an "assertion of a new value."
 * All changes must be named, to define clear journaling of acuase.
 */
export type ChangeIF<ValueType> = Mutator<ValueType> | Assertion<ValueType>;
export type SubscribeFn<ValueType> = (next: ValueType) => any;
export type IterFn<KeyType, ValueType> = (v: ValueType, k: KeyType) => void;
export type InfoParams = Record<string, any>;
export type Info = {
    message: string;
    params?: InfoParams;
    time: number;
    tree?: string;
};
export interface Notable {
    addNote(message: string, params?: InfoParams): void;
    hasNoteAt(time: number): boolean;
    notes(fromTime: number, toTime?: number): Info[];
}
export type NotesMap = Map<number, Info[]>;
