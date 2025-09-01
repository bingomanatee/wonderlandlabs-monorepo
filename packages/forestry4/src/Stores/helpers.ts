import { ActionParamsRecord, ActionExposedRecord, ValueTestFn } from '../types';
import { Store } from './Store';

export function methodize<
  DataType,
  Actions extends ActionExposedRecord = ActionExposedRecord,
>(actsMethods: ActionParamsRecord, self: Store<DataType, Actions>): Actions {
  return Array.from(Object.keys(actsMethods)).reduce((memo, key) => {
    const fn = actsMethods[key];
    memo[key] = function (...args: any[]) {
      return fn.call(self, self.value, ...args);
    };
    return memo as Partial<Actions>;
  }, {}) as Actions;
}

/**
 * Utility function to preview what the exposed action signatures will look like.
 * This transforms ActionParamsRecord (with value parameter) to ActionExposedRecord (without value parameter).
 *
 * Use this during development to see what your $ and acts properties will expose:
 *
 * @example
 * const inputActions = {
 *   addItem: (cart: Cart, productId: string, quantity: number) => { ... },
 *   removeItem: (cart: Cart, productId: string) => { ... }
 * };
 *
 * // Preview what will be exposed:
 * const exposedActions = previewActionSignatures(inputActions);
 * // exposedActions.addItem: (productId: string, quantity: number) => any
 * // exposedActions.removeItem: (productId: string) => any
 *
 * @param actsMethods - The input actions with value as first parameter
 * @returns Object showing the transformed action signatures (for type inspection only)
 */
export function previewActionSignatures<T extends ActionParamsRecord>(
  actsMethods: T,
): {
  [K in keyof T]: T[K] extends (value: any, ...args: infer Args) => infer Return
    ? (...args: Args) => Return
    : never;
} {
  const result = {} as any;

  for (const key in actsMethods) {
    const fn = actsMethods[key];
    // Create a mock function that shows the signature without the first parameter
    result[key] = function (..._args: any[]) {
      // This is just for type demonstration - not meant to be called
      throw new Error(
        `previewActionSignatures is for type inspection only. Use store.$ or store.acts to call ${key}()`,
      );
    };

    // Add metadata to help with debugging
    Object.defineProperty(result[key], 'name', { value: key });
    Object.defineProperty(result[key], 'length', {
      value: Math.max(0, fn.length - 1),
    });
  }

  return result;
}

export function testize<DataType>(
  testFunctions: ValueTestFn<DataType> | ValueTestFn<DataType>[],
  self: Store<DataType>,
): ValueTestFn<DataType> | ValueTestFn<DataType>[] {
  if (Array.isArray(testFunctions)) {
    return testFunctions.map(
      (fn) =>
        function (value: unknown) {
          return fn.call(self, value, self);
        },
    );
  } else {
    return function (value: unknown) {
      return testFunctions.call(self, value, self);
    };
  }
}
