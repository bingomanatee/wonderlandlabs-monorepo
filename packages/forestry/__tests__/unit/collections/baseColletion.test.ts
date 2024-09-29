import { expect, it, describe } from 'vitest';
import { Collection, Forest } from '../../../src';

describe('Collection', () => {
  it('allows SuperClass to be extended', () => {
    class SuperClass extends Collection<number, SuperClass> {
      constructor() {
        super(
          'superClass!',
          {
            initial: 1,

            actions: {
              increment(coll) {
                expect(coll.increment).toBeTypeOf('function');
                coll.mutate(({ value }) => value + 1, 'increment');
              },
            },
          },
          new Forest()
        );
      }

      increment() {
        this.act('increment');
      }
    }

    const sc = new SuperClass();

    expect(sc.value).toBe(1);
  });
});
