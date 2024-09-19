import { isAssert, isMutator } from '../types/types.guards.ts';
import type { ChangeIF } from '../types/types.shared.ts';
import { ValueProviderContext } from '../types/ValueProviderContext.ts';
import type { TreeIF } from '../types/types.trees.ts';

export class PreValidator {
  static validate<ValueType>(
    change: ChangeIF<ValueType>,
    tree: TreeIF<ValueType>
  ) {
    if (isAssert(change)) {
      const nextValue = change.assert;
      const test = tree.validate(nextValue);
      if (!test.isValid) {
        throw new Error(test.error ?? 'invalid value');
      }
    } else if (isMutator(change)) {
      const value = tree.top?.value;
      const nextValue = change.mutator({
        value,
        branch: tree.top,
        seed: change.seed,
        tree,
        context: ValueProviderContext.mutation,
      });
      const test = tree.validate(nextValue);
      if (!test.isValid) {
        throw new Error(test.error ?? 'invalid value');
      }
    } else {
      console.warn('bad change: ', change);
    }
  }
}
