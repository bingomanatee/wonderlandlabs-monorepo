import { expect, it, describe } from 'vitest';
import { Forest } from '../../src/Forest';
import { Collection } from '../../src';
import type { CollectionIF } from '../../src/types/type.collection';

describe('concepts', () => {
  describe('transactional', () => {
    it('should rollback collections', () => {
      const f = new Forest();

      type Egg = {
        id: string;
        daysLeft: number;
      };

      const EXPIRED_MSG = 'Egg has expired';
      const eggValidator = (e: Egg) => {
        if (e.daysLeft <= 0) {
          throw new Error(EXPIRED_MSG);
        }
      };
      const eggsValidator = (es: Egg[]) => {
        for (const e of es) {
          eggValidator(e);
        }
      };

      const INITIAL = [
        { id: 'alpha', daysLeft: 4 },
        { id: 'beta', daysLeft: 3 },
        { id: 'gamma', daysLeft: 2 },
      ];

      const LESS_ONE_DAY = [
        { id: 'alpha', daysLeft: 3 },
        { id: 'beta', daysLeft: 2 },
        { id: 'gamma', daysLeft: 1 },
      ];

      const eggs = new Collection<Egg[]>(
        'eggs',
        {
          initial: INITIAL,
          validator: eggsValidator,
          actions: {
            removeADay(coll: CollectionIF<Egg[]>) {
              for (const egg of coll.value) {
                coll.act('removeEggDay', egg.id);
              }
            },
            removeEggDay(coll: CollectionIF<Egg[]>, id: string) {
              const eggs: Egg[] = coll.value.map((egg) => {
                if (egg.id === id) {
                  return { ...egg, daysLeft: egg.daysLeft - 1 };
                }
                return egg;
              });
              coll.next(eggs);
            },
            removeEgg(coll: CollectionIF<Egg[]>, id: string) {
              coll.mutate(({ value }) => {
                const out = value.filter((egg: Egg) => egg.id !== id);
                console.log('out after rmoving', id, 'is', out);
                return out;
              }, 'removing egg ' + id);
            },
            removeADayWithCatch(coll: CollectionIF<Egg[]>) {
              for (const egg of coll.value) {
                try {
                  coll.act('removeEggDay', egg.id);
                } catch (error) {
                  if (error instanceof Error && error.message === EXPIRED_MSG) {
                    coll.act('removeEgg', egg.id);
                  } else {
                    throw error;
                  }
                }
              }
            },
          },
        },
        f
      );

      expect(eggs.value).toEqual(INITIAL);

      eggs.act('removeADay');

      expect(eggs.value).toEqual(LESS_ONE_DAY);

      expect(() => eggs.act('removeADay')).toThrow();

      expect(eggs.value).toEqual(LESS_ONE_DAY);

      eggs.act('removeADayWithCatch');
      expect(eggs.value).toEqual([
        { id: 'alpha', daysLeft: 2 },
        { id: 'beta', daysLeft: 1 },
      ]);
    });
  });
});
