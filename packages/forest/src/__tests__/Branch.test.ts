import { Forest } from '../../lib';
import { BranchIF } from '../../lib/types';
import { TypedBranchIF } from '../types';

let debug = false;
describe('forest', () => {
  describe('Branch', () => {
    describe('creation, basic functionality', () => {
      it('should be created with minimal config', () => {
        const f = new Forest();
        const b = f.createBranch({ $value: 1, name: 'one' });
        expect(b.name).toBe('one');
        expect(b.value).toBe(1);
      });

      it('should be created with custom config', () => {
        const f = new Forest();
        const b = f.createBranch({ $value: 2, name: 'two' });
        expect(b.value).toBe(2);

        b.value = 3;

        expect(b.value).toBe(3);
      });
      it('should throw an error if created without a value', () => {
        const f = new Forest();
        expect(() => {
          f.createBranch({ name: 'one' });
        }).toThrowError('bad configuration');
      });
    });

    describe('validation', () => {
      it('should prevent changing a value to a different type of item', () => {
        const f = new Forest();
        const b = f.createBranch({ $value: 1, name: 'one' });
        expect(() => {
          b.value = 'two';
        }).toThrowError('Cannot change type of Branch');
      });

      it('should reflect test constraints', () => {
        const f = new Forest();
        const b = f.createBranch({
          $value: [ 1, 2, 3 ],
          name: 'numbers',
          test(value) {
            if (Array.isArray(value)) {
              value.forEach((n, i: number) => {
                if (typeof n !== 'number') {
                  throw new Error('value ' + i + ' is not a number.');
                }
                if (n < 0) {
                  throw new Error(`value ${i} (${n}) must be >= 0`);
                }
              });
            } else {
              throw new Error('cannot accept non-array values');
            }
          },
        });
        expect(b.value).toEqual([ 1, 2, 3 ]);

        b.value = [ 4, 5, 6 ];
        expect(b.value).toEqual([ 4, 5, 6 ]);

        expect(() => (b.value = [ 4, 5, 'six' ])).toThrowError(
          'value 2 is not a number.'
        );

        expect(b.value).toEqual([ 4, 5, 6 ]);

        b.value = [ 7, 8, 9 ];

        expect(b.value).toEqual([ 7, 8, 9 ]);

        expect(() => {
          b.value = [ 1, -1, 0 ];
        }).toThrowError('value 1 (-1) must be >= 0');

        expect(b.value).toEqual([ 7, 8, 9 ]);
      });
    });

    describe('actions', () => {
      function createPoint() {
        const f = new Forest();

        type PointValue = {
          x: number;
          y: number;
        };

        const pt = f.createBranch({
          name: 'point',
          $value: {
            x: 0,
            y: 0,
          },
          actions: {
            scaleAndOffset(state, s, x, y) {
              state.do.scale(s);
              state.do.offset(x, y);
            },
            scale(state, s) {
              const typedS = state as TypedBranchIF<PointValue>;
              const newX: number = typedS.value.x * (s as number);
              const newY: number = typedS.value.y * (s as number);
              typedS.set('x', newX);
              typedS.set('y', newY);
            },
            offset(state: BranchIF, x, y) {
              const typedS = state as TypedBranchIF<PointValue>;
              const newX: number = typedS.value.x + (x as number);
              const newY: number = typedS.value.y + (y as number);
              typedS.set('x', newX);
              typedS.set('y', newY);
            },
          },
        }) as TypedBranchIF<PointValue>;

        return pt;
      }

      it('executes actions', () => {
        const pt = createPoint();

        pt.do.offset(1, 2);
        expect(pt.value).toEqual({ x: 1, y: 2 });
        pt.do.scale(5);
        expect(pt.value).toEqual({ x: 5, y: 10 });
      });

      it('allows you to call actions from actions', () => {
        const pt = createPoint();
        pt.do.offset(1, 2);

        pt.do.scaleAndOffset(5, 5, 5);

        expect(pt.value).toEqual({ x: 10, y: 15 });
      });
    });

    describe('transactional insulation', () => {
      type CartItem = {
        name: string;
        id: string;
        qty: number;
        cost: number;
      };

      type CartValue = {
        cart: CartItem[];
      };

      function makeUserCollection(): TypedBranchIF<CartValue> {
        const f = new Forest();
        return f.createBranch({
          $value: { cart: [] },
          test(value) {
            const { cart } = value as CartValue;

            cart.forEach((cartItem) => {
              if (cartItem.qty < 1) {
                console.warn('bad data:', cartItem);
                throw new Error('cart qty must be >= 0');
              }
              if (cartItem.cost <= 0) {
                console.warn('bad data:', cartItem);
                throw new Error('cart cost must be >= 0');
              }
            });
          },
          actions: {
            addCartItem(state: BranchIF, name, id, cost, qty) {
              console.log(
                'adding cart item - pending is ',
                state.forest.pending.length
              );
              if (debug) {
                console.log('---- starting addCartItem', name, id, cost, qty);
              }
              const cartState = state as TypedBranchIF<CartValue>;
              const qtyNum: number = qty as number;
              const cartItems = [ ...cartState.value.cart ];
              const existing = cartItems.findIndex((item) => {
                const match = item.id === id;
                return match;
              });

              if (existing >= 0) {
                const newCartItem = { ...cartItems[existing] };
                newCartItem.qty += qtyNum;
                if (debug) {
                  console.log(
                    '----- replacing ',
                    cartItems[existing],
                    'with',
                    newCartItem
                  );
                }
                cartItems[existing] = newCartItem;
                if (debug) {
                  console.log('new cart is:', cartItems);
                }
              } else {
                cartItems.push({
                  id: id as string,
                  qty: qtyNum,
                  cost: cost as number,
                  name: name as string,
                });
              } // --- END mutating cartItems;

              cartState.set('cart', cartItems);
            },

            addCartItems(state, items) {
              (items as CartItem[]).forEach((item) => {
                const { name, id, cost, qty } = item;
                state.do.addCartItem(name, id, cost, qty);
              });
            },
          },
          name: 'cart-state',
        }) as TypedBranchIF<CartValue>;
      }

      const SEED_INSERTS = [
        { name: 'figs', id: 'figs-01', cost: 100, qty: 5 },
        {
          name: 'wigs',
          id: 'wigs-01',
          cost: 50,
          qty: 2,
        },
      ];

      const BAD_ITEMS = [
        { name: 'figs', id: 'figs-01', cost: 100, qty: 3 },
        { name: 'pigs', id: 'pigs-01', cost: 200, qty: -1 },
      ];

      /**
       * this test ensures that either all the items in cartItems succeed or none of them do.
       */
      it.only('should do all or nothing when updating cart', () => {
        const cartState = makeUserCollection();
        cartState.subscribe((value) =>
          console.info('-----[observed] cartState is', value)
        );
        expect(cartState.forest.pending.length).toBe(0);
        cartState.do.addCartItems(SEED_INSERTS);
        expect(cartState.forest.pending.length).toBe(0);

        /**
         *
         *  the point of this test is that the addition of the first item (figs)
         *  should be rolled back because the second item creates an invalid quantity.
         *  Even though the first addCartItem completes successfully, it is run
         *  in the context of the second addCartItem, causing it to be flushed.
         */
        expect(cartState.value.cart).toEqual(SEED_INSERTS);

        expect(() => cartState.do.addCartItems(BAD_ITEMS)).toThrow();

        expect(cartState.value.cart).toEqual(SEED_INSERTS);
      });
      /**
       * this test ensures that either all the items in cartItems succeed or none of them do.
       */
      it('should partially change the data if addCartItems is externalized', () => {
        const cartState = makeUserCollection();

        cartState.do.addCartItems(SEED_INSERTS);

        /**
         *
         *  the point of this test is that the addition of the first item (figs)
         *  should be rolled back because the second item creates an invalid quantity.
         *  Even though the first addCartItem completes successfully, it is run
         *  in the context of the second addCartItem, causing it to be flushed.
         */
        expect(cartState.value.cart).toEqual(SEED_INSERTS);
        cartState.subscribe((items) =>
          console.log(
            ' [OBSERVED] cart items:',
            JSON.stringify((items as CartValue).cart)
          )
        );
        debug = true;
        expect(() => {
          (BAD_ITEMS as CartItem[]).forEach((item) => {
            const { name, id, cost, qty } = item;
            console.log('adding cart item:', item, '...');
            cartState.do.addCartItem(name, id, cost, qty);
            console.log('... added cart item:', item);
          });
        }).toThrow();

        expect(cartState.value.cart).toEqual([
          { id: 'figs-01', qty: 8, cost: 100, name: 'figs' },
          { id: 'wigs-01', qty: 2, cost: 50, name: 'wigs' },
        ]); // when externalized, the quantity update from figs succeeds
      });
    });
  });
});
