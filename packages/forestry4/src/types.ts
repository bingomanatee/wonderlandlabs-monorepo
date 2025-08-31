import { z } from 'zod';

import { Subject, Subscription, Observer } from 'rxjs';
import { ZodParser } from './typeguards';

export type ActionMethodFn<DataType = unknown> = (
  value: DataType,
  ...args: unknown[]
) => unknown;

export type ActionFn = (...args: unknown[]) => unknown;

export type ActionMethodRecord = Record<string, ActionMethodFn>;
export type ActionRecord = Record<string, ActionFn>;
export type ValueTestFn<DataType> = (
  value: unknown,
  store: StoreIF<DataType>,
) => null | void | string;

export type Listener<DataType> = Partial<Observer<DataType>> | ((value: DataType) => void);

export type Validity = {
  isValid: boolean;
  error?: Error;
};

export interface StoreIF<
  DataType,
  Actions extends ActionRecord = ActionRecord,
> {
  value: DataType;
  name: string;

  subscribe(listener: Listener<DataType>): Subscription;

  acts: Actions;
  $: Actions;
  next: (value: DataType) => boolean;

  complete: () => DataType;
  isActive: boolean;

  // validators
  schema?: ZodParser;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];

  validate(value: unknown): Validity;

  isValid(value: unknown): boolean;
}

export interface StoreTree<
  DataType,
  Actions extends ActionRecord = ActionRecord,
> extends StoreIF<DataType, Actions> {
  path: Path;
  isRoot: boolean;
  parent?: StoreTree<unknown>;
  broadcast: (message: unknown, fromRoot?: boolean) => void;
  receiver: Subject<unknown>;
  set(value, path): boolean;
  subject: Subject<DataType>;
}

export type StoreParams<DataType, Actions = ActionMethodRecord> = {
  value: DataType;
  acts: Actions;
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
  name?: string;
  debug?: boolean;
};

type PathElement = string;

export type Path = PathElement[] | string;
