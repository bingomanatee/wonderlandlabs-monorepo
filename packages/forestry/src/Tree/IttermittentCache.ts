import { ValueProviderContext } from "../types/types.shared";
import type { TreeIF, TreeParams } from "../types/types.trees";

export const CLONE_NAME = "!BENCHMARK!";

export class IttermittentCache {
  static benchmark<ValueType>(tree: TreeIF<ValueType>) {
    if (!tree.top || !tree.params?.cloneInterval) {
      return;
    }

    const { cloneInterval, serializer } = tree.params as TreeParams<ValueType>;

    let check = tree.top;
    let count = 0;
    while (check) {
      if (count >= cloneInterval) {
        const clonedValue: ValueType = serializer({
          tree,
          branch: check,
          context: ValueProviderContext.itermittentCache,
          value: check.value,
        });

        try {
          const next = tree.top?.add({
            assert: clonedValue,
            name: CLONE_NAME,
          });
          tree.top = next;
        } catch (e) {
          console.warn("cannot clone! error is ", e);
        }
        return;
      }
      if (check.cause == CLONE_NAME) {
        return;
      }
      count += 1;
      check = check.prev;
    }
  }
}
