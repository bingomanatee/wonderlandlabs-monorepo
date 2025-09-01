import { ActionMethodRecord, ActionRecord, ValueTestFn } from '../types';
import { Store } from './Store';

export function methodize<
  DataType,
  Actions extends ActionRecord = ActionRecord,
>(actsMethods: ActionMethodRecord, self: Store<DataType, Actions>): Actions {
  return Array.from(Object.keys(actsMethods)).reduce((memo, key) => {
    const fn = actsMethods[key];
    memo[key] = function (...args: any[]) {
      return fn.call(self, self.value, ...args);
    };
    return memo as Partial<Actions>;
  }, {}) as Actions;
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
