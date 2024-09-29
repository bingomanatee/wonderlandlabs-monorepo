import { expect, it, describe } from 'vitest';
import { Forest } from '../../src/Forest';
import { Collection } from '../../src';
import type { CollectionIF } from '../../src/types/type.collection';

type Egg = {
  id: string;
  daysLeft: number;
};
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

    it('should observe change', () => {
      const f = new Forest();

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

      const eggsCollection = new Collection<Egg[]>(
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

      type EggSummary = Record<string, number>;

      function summary(eggs: Egg[]): EggSummary {
        const out: EggSummary = {};
        for (const egg of eggs) {
          out[egg.id] = egg.daysLeft;
        }
        return out;
      }

      type EggTimer = {
        time: number;
        eggs: EggSummary;
        source: string;
        act: string;
      };
      const log: EggTimer[] = [];

      f.observe('eggs').subscribe((eggs: Egg[]) => {
        log.push({
          eggs: summary(eggs),
          time: f.time,
          source: 'observe',
          act: eggsCollection.tree.top?.cause,
        });
      });

      eggsCollection.tree.subscribe((eggs: Egg[]) => {
        log.push({
          eggs: summary(eggs),
          time: f.time,
          source: 'tree.subscribe',
          act: eggsCollection.tree.top?.cause,
        });
      });

      eggsCollection.act('removeADay');
      eggsCollection.act('removeADayWithCatch');


      expect(log).toEqual([
        { eggs: { alpha: 4, beta: 3, gamma: 2 }, time: 1, source: 'observe', act: 'INITIAL VALUE' },
        {
          eggs: { alpha: 4, beta: 3, gamma: 2 },
          time: 1,
          source: 'tree.subscribe',
          act: 'INITIAL VALUE',
        },
        { eggs: { alpha: 3, beta: 3, gamma: 2 }, time: 5, source: 'tree.subscribe', act: '(next)' },
        { eggs: { alpha: 3, beta: 2, gamma: 2 }, time: 8, source: 'tree.subscribe', act: '(next)' },
        {
          eggs: { alpha: 3, beta: 2, gamma: 1 },
          time: 11,
          source: 'tree.subscribe',
          act: '(next)',
        },
        { eggs: { alpha: 3, beta: 2, gamma: 1 }, time: 11, source: 'observe', act: '(next)' },
        {
          eggs: { alpha: 2, beta: 2, gamma: 1 },
          time: 15,
          source: 'tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 2, beta: 1, gamma: 1 },
          time: 18,
          source: 'tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 2, beta: 1 },
          time: 23,
          source: 'tree.subscribe',
          act: 'removing egg gamma',
        },
        { eggs: { alpha: 2, beta: 1 }, time: 23, source: 'observe', act: 'removing egg gamma' },
      ]);
    });
  });
});
