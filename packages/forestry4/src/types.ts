import { z } from 'zod';

import { Subscription } from 'rxjs';
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
  subscribe(Listener: (value: DataType) => void): Subscription;
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

export type StoreParams<DataType, Actions = ActionMethodRecord> = {
  value: DataType;
  acts: Actions;
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];
  name?: string;
};
