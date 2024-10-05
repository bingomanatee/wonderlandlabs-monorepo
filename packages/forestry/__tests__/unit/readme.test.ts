import { Forest, Collection } from '../../src/index';
import { expect, it, describe } from 'vitest';
import type { MutationValueProviderFN, ValueProviderParams } from '../../src/types/types.shared';

function message(...items: any[]) {
  //  eslint-disable-next-line no-constant-condition
  if (false) {
    console.log(...items);
  }
}

function makeCounter(initial = 0, name = 'counter') {
  const f = new Forest();

  return new Collection(
    name,
    {
      initial,
      actions: {
        increment(collection) {
          collection.mutate(({ value }) => {
            return value === undefined ? 1 : value + 1;
          }, 'increment');
        },
        decrement(collection) {
          collection.mutate(({ value }) => {
            return value === undefined ? -1 : value - 1;
          }, 'increment');
        },
        add(collection, n: number) {
          collection.mutate<number>(
            (params) => {
              const { value, seed } = params;
              return value === undefined ? seed : value + seed;
            },
            n,
            'add'
          );
        },
        zeroOut(collection) {
          collection.next(0, 'zeroOut');
        }
      },
      benchmarkInterval: 6,
      serializer(params: ValueProviderParams<number>) {
        const { value } = params;
        return value === undefined ? 0 : value;
      },
      validator(v) {
        if (Number.isNaN(v)) {
          throw new Error('must be a number');
        }
        if (v !== Math.floor(v)) {
          throw new Error('must be integer');
        }
      },
    },
    f
  );
}

describe('README.md', () => {
  it('should run example 1', () => {
    const f = new Forest();

    const t = f.addTree<number>('counter', { initial: 0 });
    t.subscribe((value: number) => {
      message('tree change', t.top?.cause, ':', value);
    });

    const growBy: MutationValueProviderFN<number, number> = ({ value, seed }) => {
      return Number(seed ?? 0 + (value ?? 0));
    };

    t.mutate<number>(growBy, 3, 'growBy 3');

    t.mutate<number>(growBy, 4, 'growBy 4');

    t.next(100, 'set to 100');
    expect(t.value).toBe(100);

    t.forEachDown((branch, count) => {
      message(
        count,
        'README.md -- at',
        branch.time,
        'cause:',
        branch.cause,
        'value:',
        branch.value
      );
    });
    /**
      0 README.md -- at 7 cause: set to 100 value: 100
      1 README.md -- at 5 cause: growBy 4 value: 4
      2 README.md -- at 3 cause: growBy 3 value: 3
      3 README.md -- at 1 cause: initial value: 0
     */
  });

  it('collection example', () => {
    const counter = makeCounter(0);

    counter.subscribe((n: number) =>
      message('collection is ', n, 'because of', counter.tree.top?.cause)
    );

    counter.act('increment');
    counter.act('increment');
    counter.act('increment');
    counter.act('add', 100);
    expect(() => counter.act('add', 1.5)).toThrow('must be integer');
    counter.act('zeroOut');
    counter.act('add', 300);
    counter.act('increment');
    counter.act('decrement');
    /**
     *
      collection is  0 because of initial
      collection is  1 because of increment
      collection is  2 because of increment
      collection is  3 because of increment
      collection is  103 because of add
      collection is  0 because of zeroOut
      collection is  300 because of add
      collection is  301 because of increment
      collection is  300 because of decrement
     */
  });

  it('occasionally caches', () => {
    const counter = makeCounter(0, 'counter:cached');

    counter.act('increment');
    counter.act('increment');
    counter.act('increment');
    counter.act('add', 100);
    expect(() => counter.act('add', 1.5)).toThrow('must be integer');
    counter.act('zeroOut');
    counter.act('add', 300);
    counter.act('increment');
    counter.act('decrement');

    counter.tree.forEachDown((branch) => {
      message(branch.time, ':counter value: ', branch.value, 'cause:', branch.cause);
    });

    /**
     *
      28 :counter value:  0 cause: increment
      25 :counter value:  1 cause: increment
      22 :counter value:  0 cause: !BENCHMARK!
      21 :counter value:  300 cause: add
      18 :counter value:  0 cause: zeroOut
      13 :counter value:  103 cause: add
      10 :counter value:  3 cause: increment
      7 :counter value:  2 cause: increment
      4 :counter value:  1 cause: increment
      1 :counter value:  0 cause: initial

     */
  });
});
