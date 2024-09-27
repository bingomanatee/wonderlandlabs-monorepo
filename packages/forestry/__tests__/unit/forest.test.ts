import { Forest } from './../../src/Forest';
import type {
  ChangeIF,
  MutationValueProviderParams,
} from '../../src/types/types.shared';
import { expect, it, describe } from 'vitest';

type Numeric = { num: number };
function growBy(n: number): ChangeIF<Numeric> {
  return {
    mutator(mParams: MutationValueProviderParams<Numeric>) {
      const { value, seed } = mParams;

      if (value === undefined) {
        return { num: Number(seed) };
      }
      return { num: Number(value.num + seed) };
    },
    seed: n,
    name: 'growBy',
  };
}

describe('Forest', () => {
  describe('constructor', () => {
    it('should start without any branches', () => {
      const f = new Forest();

      expect(f.hasTree('foo')).toBeFalsy();
    });

    it('should allow trees to be added', () => {
      const f = new Forest();

      f.addTree('foo', { initial: 1 });
      expect(f.hasTree('foo')).toBeTruthy();

      expect(f.tree('foo')?.value).toBe(1);

      f.addTree('bar', { initial: 100 });
      expect(f.tree('bar')?.value).toBe(100);
    });
  });

  describe('do', () => {
    it('should return the result of the function', () => {
      const f = new Forest();
      f.addTree('foo', { initial: 100 });
      f.addTree('bar', { initial: 300 });

      const sum = f.do<number>((f) => {
        return (
          (f.tree<number>('foo')?.value ?? 0) +
          (f.tree<number>('bar')?.value ?? 0)
        );
      });

      expect(sum).toEqual(400);
    });

    it('should regress two branches if both are changed in a do', () => {
      const f = new Forest();
      const foo = f.addTree('foo', {
        initial: 100,
        validator(n) {
          if (n % 100) {
            throw new Error('foo must be multiple of 100');
          }
        },
      });
      const bar = f.addTree('bar', { initial: 300 });

      expect(() => {
        f.do(() => {
          f.tree<number>('bar')?.next(500, 'next');
          f.tree<number>('foo')?.next(333, 'next');
        });
      }).toThrow('foo must be multiple of 100');
      expect(foo.value).toBe(100);
      expect(bar.value).toBe(300);
    });
  });

  describe('observe', () => {
    it('should observe values', () => {
      const f = new Forest();

      const t = f.addTree<Numeric>('should-observe-values', {
        initial: { num: 0 },
        validator(value) {
          if (value === undefined) {
            return;
          }
          if (!(value.num % 3)) {
            throw new Error('no values divisible by 3');
          }
        },
      });

      const values: number[] = [];
      f.observe<Numeric>(t.name!).subscribe((v: Numeric) => {
        if (v) {
          values.push(v.num);
        }
      });
      expect(values).toEqual([ ]);

      t.grow(growBy(2));

      expect(t.value).toEqual({ num: 2 });
      expect(values).toEqual([ 2 ]);

      f.do(() => {
        t.grow(growBy(2));
        t.grow(growBy(3));
        t.grow(growBy(4));
      });

      expect(() => {
        f.do(() => {
          t.grow(growBy(4));
        });
      }).toThrow();

      expect(values).toEqual([  2, 11 ]);
      t.grow(growBy(0));
      expect(values).toEqual([ 2, 11 ]);
    });
  });

  describe('notes', () => {
    it('should add notes without params', () => {
      const f = new Forest();

      const t = f.addTree<string>('foo', { initial: '' });
      expect(t.notes(0, Number.MAX_SAFE_INTEGER)).toEqual([]);

      f.addNote('foo starts blank');
      expect(f.notes(0, Number.MAX_SAFE_INTEGER)).toEqual([
        {
          time: 1,
          message: 'foo starts blank',
          tree: undefined,
          params: undefined,
        },
      ]);

      t.next('a');
      t.next('b');

      f.addNote('foo is at b');

      expect(f.notes(0, Number.MAX_SAFE_INTEGER)).toEqual([
        {
          time: 1,
          message: 'foo starts blank',
          tree: undefined,
          params: undefined,
        },
        { time: 5, message: 'foo is at b', tree: undefined, params: undefined },
      ]);
    });
  });
});
