import { describe, expect, it } from 'vitest';
import { Forest } from '../../build/src/Forest';
import { Collection } from '../../src';
import { CollectionIF } from '../../build/src/types/types.collections';
import { sortBy } from 'lodash-es';

type Egg = {
  id: string;
  daysLeft: number;
};

function console_log() {}

describe('docs', () => {
  describe('cart', () => {
    interface Product {
      name: string;
      id: string;
      cost: number;
    }

    function isProduct(product: unknown): product is Product {
      return (
        typeof product === 'object' &&
        product !== null &&
        'name' in product &&
        'id' in product &&
        'cost' in product &&
        typeof (product as { name: unknown }).name === 'string' &&
        typeof (product as { id: unknown }).id === 'string' &&
        typeof (product as { cost: unknown }).cost === 'number' &&
        (product as { cost: number }).cost >= 0
      );
    }

    function validProduct(product: unknown): asserts product is Product {
      if (!isProduct(product)) {
        throw new Error('Invalid product');
      }
    }

    function validCart(items) {
      if (!Array.isArray(items)) {
        throw new Error('must be an array');
      }
      items.forEach(validProduct);
    }

    const api = {
      async getCart(): Promise<Product[]> {
        return [
          { id: 'tshirt', name: 'T Shirt', cost: 20 },
          { id: 'ybox', name: 'Y-box', cost: 200 },
          { id: 'pencil', name: 'Pencil', cost: 5 },
          { id: 'mtruck', name: 'Monster-Truck', cost: 50000 },
        ];
      },
    };
    it('should load and respect constraints', async () => {
      const cart = new Collection<Product[]>(
        'cart',
        {
          initial: [],
          validator: validCart,
        },

        {
          applyDiscount({ id, amount }) {
            const newProducts = this.value.map((product) => {
              if (product.id === id) {
                return { ...product, cost: product.cost - amount };
              } else {
                return product;
              }
            });
            this.next(newProducts);
          },
          mostExpensiveProducts() {
            return sortBy(this.value, 'cost').reverse();
          },
          discountedProduct({ id, amount }: { id: string; amount: number }) {
            // doesn't change state - just returns a candidate

            const product = this.acts
              .mostExpensiveProducts()
              .find((p) => p.id === id);
            return { ...product, cost: product.cost - amount };
          },
          percentDiscount({
            percent,
            maxSaving,
          }: {
            percent: number; // amount off 0..1
            maxSaving: number;
          }) {
            // should $validate rational values of percent/maxDate
            let saved = 0;
            for (const p of this.acts.mostExpensiveProducts()) {
              let discount = p.cost * percent;
              if (saved + discount > maxSaving) {
                discount = maxSaving - saved;
              }
              saved += discount;
              const discountedProduct = this.acts.discountedProduct({
                id: p.id,
                amount: discount,
              });
              this.acts.updateProduct(discountedProduct);
              if (saved >= maxSaving) {
                break;
              }
            }
            return saved;
          },
          updateProduct(product: Product) {
            // should $validate existence in list
            this.next(
              this.value.map((p) => (p.id === product.id ? product : p)),
            );
          },
        },
      );

      async function loadCart() {
        const products = await api.getCart();
        try {
          cart.next(products);
        } catch (err) {
          window.alert('your products are not valid');
        }
      }

      loadCart().then(() => {
        try {
          console_log('products loaded:', cart.value);
          const saved = cart.acts.applyDiscount({ id: 'tshirt', amount: 5000 });
          console_log('discount applied, saved', saved);
        } catch (err) {
          console_log('you cannot discount t-shirt by $5,000');
        }
        const discount = { percent: 0.2, maxSaving: 10020 };
        const saving = cart.acts.percentDiscount(discount);
        console_log(
          '--- after ',
          100 * discount.percent,
          '% savings up to ',
          discount.maxSaving,
          'saved',
          saving,
          cart.value,
        );
        expect(saving).toBeLessThanOrEqual(discount.maxSaving);
        expect(cart.value.find((p) => p.id === 'pencil').cost).toBe(5);
      });
    });
  });
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
        },
        {
          removeADay(this: CollectionIF<Egg[]>) {
            for (const egg of this.value) {
              this.acts.removeEggDay(egg.id);
            }
          },
          removeEggDay(this: CollectionIF<Egg[]>, id: string) {
            const eggs: Egg[] = this.value.map((egg) => {
              if (egg.id === id) {
                return { ...egg, daysLeft: egg.daysLeft - 1 };
              }
              return egg;
            });
            this.next(eggs);
          },
          removeEgg: function (this: CollectionIF<Egg[]>, id: string) {
            this.mutate(({ value }) => {
              return value.filter((egg: Egg) => egg.id !== id);
            }, 'removing egg ' + id);
          },
          removeADayWithCatch(this: CollectionIF<Egg[]>) {
            for (const egg of this.value) {
              try {
                this.acts.removeEggDay(egg.id);
              } catch (error) {
                if (error instanceof Error && error.message === EXPIRED_MSG) {
                  this.acts.removeEgg(egg.id);
                } else {
                  throw error;
                }
              }
            }
          },
        },
        f,
      );

      expect(eggs.value).toEqual(INITIAL);

      eggs.acts.removeADay();

      expect(eggs.value).toEqual(LESS_ONE_DAY);

      expect(() => eggs.acts.removeADay()).toThrow();

      expect(eggs.value).toEqual(LESS_ONE_DAY);

      eggs.acts.removeADayWithCatch();
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
        },

        {
          removeADay(this: CollectionIF<Egg[]>) {
            for (const egg of this.value) {
              this.acts.removeEggDay(egg.id);
            }
          },
          removeEggDay(this: CollectionIF<Egg[]>, id: string) {
            const eggs: Egg[] = this.value.map((egg) => {
              if (egg.id === id) {
                return { ...egg, daysLeft: egg.daysLeft - 1 };
              }
              return egg;
            });
            this.next(eggs);
          },
          removeEgg(this: CollectionIF<Egg[]>, id: string) {
            this.mutate(
              ({ value }) => {
                return value.filter((egg: Egg) => egg.id !== id);
              },
              null,
              'removing egg ' + id,
            );
          },
          removeADayWithCatch(this: CollectionIF<Egg[]>) {
            for (const egg of this.value) {
              try {
                this.acts.removeEggDay(egg.id);
              } catch (error) {
                if (error instanceof Error && error.message === EXPIRED_MSG) {
                  this.acts.removeEgg(egg.id);
                } else {
                  throw error;
                }
              }
            }
          },
        },
        f,
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
          source: '$tree.subscribe',
          act: eggsCollection.tree.top?.cause,
        });
      });

      eggsCollection.acts.removeADay();
      eggsCollection.acts.removeADayWithCatch();

      expect(log).toEqual([
        {
          eggs: { alpha: 4, beta: 3, gamma: 2 },
          time: 1,
          source: 'observe',
          act: 'INITIAL VALUE',
        },
        {
          eggs: { alpha: 4, beta: 3, gamma: 2 },
          time: 1,
          source: '$tree.subscribe',
          act: 'INITIAL VALUE',
        },
        {
          eggs: { alpha: 3, beta: 3, gamma: 2 },
          time: 5,
          source: '$tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 3, beta: 2, gamma: 2 },
          time: 8,
          source: '$tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 3, beta: 2, gamma: 1 },
          time: 11,
          source: '$tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 3, beta: 2, gamma: 1 },
          time: 11,
          source: 'observe',
          act: '(next)',
        },
        {
          eggs: { alpha: 2, beta: 2, gamma: 1 },
          time: 15,
          source: '$tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 2, beta: 1, gamma: 1 },
          time: 18,
          source: '$tree.subscribe',
          act: '(next)',
        },
        {
          eggs: { alpha: 2, beta: 1 },
          time: 23,
          source: '$tree.subscribe',
          act: 'removing egg gamma',
        },
        {
          eggs: { alpha: 2, beta: 1 },
          time: 23,
          source: 'observe',
          act: 'removing egg gamma',
        },
      ]);
    });
  });
});
