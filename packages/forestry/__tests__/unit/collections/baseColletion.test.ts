import { expect, it, describe } from 'vitest';
import { Collection, Forest } from '../../../src';
import { CollectionIF } from '../../../build/src/types/types.collections';

describe('Collection', () => {
  it('allows update', () => {
    const f = new Forest();

    const c = new Collection('incdec', { initial: 1 }, {}, f);

    expect(c.value).toBe(1);

    const incrementor = (n) => n + 1;

    c.update(incrementor);
    c.update(incrementor);

    expect(c.value).toBe(3);
  });

  it('allows SuperClass to be extended', () => {
    class SuperClass extends Collection<number> {
      constructor() {
        super(
          'superClass!',
          {
            initial: 1,
          },
          {
            increment(this: CollectionIF<number>) {
              this.mutate(({ value }) => value + 1, 'increment');
            },
          },
          new Forest(),
        );
      }

      increment() {
        this.acts.increment();
      }
    }

    const sc = new SuperClass();

    expect(sc.value).toBe(1);
    sc.increment();
    expect(sc.value).toBe(2);
  });
});
