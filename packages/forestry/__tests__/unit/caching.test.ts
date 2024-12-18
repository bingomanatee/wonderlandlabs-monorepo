import { Forest } from '../../build/src/Forest';
import { BENCHMARK_CAUSE } from '../../build/src/treeHelpers/BenchMarker';
import type { BranchIF } from '../../build/src/types/types.branch';
import type {
  MutationValueProviderFN,
  Mutator,
} from '../../build/src/types/types.shared';
import { expect, it, describe } from 'vitest';

describe('caching', () => {
  describe('Beaver', () => {
    it('should maintain a length of no longer than (maxLength + 1', () => {
      const f = new Forest();

      const MAX_BRANCHES = 10;
      const doubler = f.addTree<number>('beaver-test', {
        maxBranches: MAX_BRANCHES,
        initial: 100,
        trimTo: 5,
        serializer: ({ value }) => {
          return value ?? 0;
        },
      });

      const branchCount: number[] = [];
      const branchValues = new Map<number, number>();

      const doublerGrower: Mutator<number> = {
        mutator: ({ value }) => {
          if (value === undefined) {
            return 1;
          }
          return value * 2;
        },
        name: 'doubler',
      };

      function checkBranchValues() {
        let branch = doubler.top;

        while (branch) {
          if (!branchValues.has(branch.time)) {
            branchValues.set(branch.time, branch.value);
          } else if (branchValues.get(branch.time) !== branch.value) {
            throw new Error('trimming should not change branch values');
          }
          branch = branch.prev;
        }
      }

      for (let i = 0; i < 40; ++i) {
        doubler.grow(doublerGrower);
        branchCount.push(doubler.branchCount());
        expect(checkBranchValues).not.toThrow();
      }
      const max = Math.max(...branchCount);
      expect(max).toBeLessThanOrEqual(MAX_BRANCHES);
    });
  });

  describe('local caching', () => {
    it('should only keep the latest value', () => {
      const f = new Forest();

      const t = f.addTree<number>('doubler', {
        initial: 1,
        validator(value) {
          if (typeof value !== 'number' || Number.isNaN(value)) {
            throw new Error('not a number');
          }
        },
      });

      const mut: MutationValueProviderFN<number, number> = ({ value, seed }) =>
        value ? seed * value : 1;

      t.mutate(mut, 1);
      t.mutate(mut, 2);
      t.mutate(mut, 3);
      t.mutate(mut, 4);
      t.mutate(mut, 5);
      t.mutate(mut, 6);
      t.mutate(mut, 7);

      let cachedCount = 0;
      t.forEachDown((branch: BranchIF<number>) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        branch.value;
        if (branch.valueIsCached) {
          cachedCount += 1;
        }
      });
      expect(cachedCount).toBe(1);
    });
    it('should only keep the latest value with a validator', () => {
      const f = new Forest();

      const t = f.addTree<number>('doubler', {
        initial: 1,
        validator(value) {
          if (typeof value !== 'number' || Number.isNaN(value)) {
            throw new Error('not a number');
          }
        },
      });

      const mut: MutationValueProviderFN<number, number> = ({ value, seed }) =>
        value ? seed * value : 1;

      t.mutate(mut, 1);
      t.mutate(mut, 2);
      t.mutate(mut, null);
      t.mutate(mut, 3);
      t.mutate(mut, 4);
      t.mutate(mut, 5);
      t.mutate(mut, 6);
      t.mutate(mut, 7);

      let cachedCount = 0;
      t.forEachDown((branch: BranchIF<number>) => {
        //  eslint-disable-next-line   @typescript-eslint/no-unused-expressions
        branch.value;
        if (branch.valueIsCached) {
          cachedCount += 1;
        }
      });
      expect(cachedCount).toBe(1);
    });
  });

  describe('Ittermittent Caching', () => {
    it('should preserve branch structure', () => {
      const f = new Forest();

      const t = f.addTree<number>('fib', {
        initial: 0,
        benchmarkInterval: 4,
        serializer({ value }) {
          return value;
        },
      });

      const fib: MutationValueProviderFN<number> = ({ value, branch }) => {
        if (branch?.prev) {
          return value + branch.prev.value;
        }
        return value || 1;
      };

      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);
      t.mutate(fib);

      const history: { value: number; cause: string }[] = [];

      t.forEachUp((b) => {
        history.push({ value: b.value, cause: b.cause });
        if (b && b.prev && b.prev.prev) {
          expect(b.value).toEqual(b.prev.value + b.prev.prev.value);
        }
      });

      history.forEach(({ cause }, i) => {
        if (cause === BENCHMARK_CAUSE) {
          const preset = history.slice(
            Math.max(0, i - (t.params?.benchmarkInterval ?? 0) - 1),
            i,
          );
          if (i > 4) {
            expect(preset[0].cause).toBe(BENCHMARK_CAUSE);
            // eslint-disable @typescript-eslint/no-unused-expressions
            expect(
              preset.slice(1).every((bc) => bc.cause !== BENCHMARK_CAUSE),
            ).toBeTruthy();
            // eslint-enable @typescript-eslint/no-unused-expressions
          }
        }
      });
    });
  });
});
