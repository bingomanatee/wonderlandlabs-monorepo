import { z } from 'zod';

import { Subscription } from 'rxjs';

export type ActionMethodFn<DataType = unknown> = (
  value: DataType,
  ...args: unknown[]
) => unknown;

export type ActionFn = (...args: unknown[]) => unknown;

export type ActionMethodRecord = Record<string, ActionMethodFn>;
export type ActionRecord = Record<string, ActionFn>;
export type ValueTestFn = (value: unknown) => null | void | string;

export interface StoreIF<
  DataType,
  Actions extends ActionRecord = ActionRecord,
> {
  value: DataType;
  subscribe(Listener: (value: DataType) => void): Subscription;
  acts: Actions;
  $: Actions;
  next: (value: DataType) => boolean;

  complete: () => DataType;
  isActive: boolean;

  // validators
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn;
}

export type StoreParams<DataType, Actions = ActionMethodRecord> = {
  value: DataType;
  acts: Actions;
  schema?: z.ZodSchema<DataType>;
  tests?: ValueTestFn;
};
