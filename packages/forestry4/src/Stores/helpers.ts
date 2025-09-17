import { ValueTestFn } from '../types';
import { Store } from './Store';

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
