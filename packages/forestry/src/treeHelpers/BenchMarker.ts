import type { BranchIF } from './../types/types.branch';
import { isAssert, isMutator } from './../types/types.guards';
import type { ChangeIF } from './../types/types.shared';
import { ValueProviderContext } from './../types/ValueProviderContext';
import type { TreeIF } from './../types/types.trees';

export const BENCHMARK_CAUSE = '!BENCHMARK!';

export class BenchMarker<ValueType> {
  constructor(private tree: TreeIF<ValueType>) {}
  static shouldBenchmark<ValueType>(
    tree: TreeIF<ValueType>,
    change: ChangeIF<ValueType>,
  ) {
    if (change.name === BENCHMARK_CAUSE) {
      return false;
    }
    if (!tree.params) {
      return false;
    }

    const { benchmarkInterval, serializer } = tree.params;
    if (!serializer) {
      return false;
    }

    let isBenchmarked = false;
    let count;
    tree.forEachDown((b: BranchIF<ValueType>, c) => {
      if (b.cause === BENCHMARK_CAUSE) {
        isBenchmarked = true;
        return true;
      }
      count = c;
      return undefined;
    }, benchmarkInterval);

    if (count < benchmarkInterval - 1) {
      return false;
    }
    return !isBenchmarked;
  }

  benchmark(change: ChangeIF<ValueType>) {
    const { serializer } = this.tree.params;
    if (isMutator(change)) {
      const next = change.mutator({
        branch: this.tree.top,
        value: this.tree.top?.value,
        tree: this.tree,
        seed: change.seed,
        context: ValueProviderContext.mutation,
      });
      const serialized = serializer({
        value: next,
        branch: this.tree.top,
        tree: this.tree,
        context: ValueProviderContext.itermittentCache,
      });
      this.tree.next(serialized, BENCHMARK_CAUSE);
    } else if (isAssert(change)) {
      const serialized = serializer({
        value: change.assert,
        tree: this.tree,
        branch: this.tree.top,
        context: ValueProviderContext.itermittentCache,
      });
      this.tree.next(serialized, BENCHMARK_CAUSE);
    }
    this.tree.addNote('benchmark serialized ' + change.name);
  }
}
