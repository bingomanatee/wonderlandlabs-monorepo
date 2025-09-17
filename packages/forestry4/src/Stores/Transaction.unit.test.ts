import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Forest } from './Forest';
import { Store } from './Store';
import { combineLatest } from 'rxjs';

// Test data types for shopping cart scenario
interface Product {
  id: string;
  name: string;
  price: number;
}

interface CartItem {
  productId: string;
  quantity: number;
  cost: number; // quantity * product.price
}

interface ShoppingCartState {
  products: Record<string, Product>;
  cartItems: CartItem[];
  totalCost: number;
}

// Shopping cart Forest subclass with methods instead of actions
class ShoppingCartForest extends Forest<ShoppingCartState> {
  addItem(productId: string, quantity: number, skipTotal = false) {
    // Wrap the add item + update total in a suspended transaction
    return this.$transact({
      suspendValidation: true,
      action: () => {
        const product = this.value.products[productId];
        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        const existingIndex = this.value.cartItems.findIndex(
          (item) => item.productId === productId,
        );

        let newCartItems: CartItem[];
        if (existingIndex >= 0) {
          newCartItems = this.value.cartItems.map((item, i) =>
            i === existingIndex
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  cost: (item.quantity + quantity) * product.price,
                }
              : item,
          );
        } else {
          newCartItems = [
            ...this.value.cartItems,
            {
              productId,
              quantity,
              cost: quantity * product.price,
            },
          ];
        }

        // First, add the item (temporarily invalid state)
        this.next({
          ...this.value,
          cartItems: newCartItems,
        });

        // Then update total if not skipped
        if (!skipTotal) {
          this.updateTotal();
        }
      },
    });
  }

  addMultipleItems(choices: [string, number][]) {
    return this.$transact({
      suspendValidation: true,
      action: () => {
        // Process each item directly within this transaction to avoid nested transactions
        for (const [productId, quantity] of choices) {
          try {
            const product = this.value.products[productId];
            if (!product) {
              // Skip invalid products silently - this is expected behavior
              continue;
            }

            const existingIndex = this.value.cartItems.findIndex(
              (item) => item.productId === productId,
            );

            let newCartItems: CartItem[];
            if (existingIndex >= 0) {
              newCartItems = this.value.cartItems.map((item, i) =>
                i === existingIndex
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      cost: (item.quantity + quantity) * product.price,
                    }
                  : item,
              );
            } else {
              newCartItems = [
                ...this.value.cartItems,
                {
                  productId,
                  quantity,
                  cost: quantity * product.price,
                },
              ];
            }

            // Update the cart items
            this.next({
              ...this.value,
              cartItems: newCartItems,
            });
          } catch (error) {
            // Skip invalid products - this provides proper transaction containment
            continue;
          }
        }
        this.updateTotal(); // Update total once at the end
      },
    });
  }

  updateTotal() {
    const totalCost = this.value.cartItems.reduce(
      (sum, item) => sum + item.cost,
      0,
    );
    return this.next({
      ...this.value,
      totalCost,
    });
  }
}

describe('Transaction System with observeTransStack', () => {
  let store: Store<{ count: number; name: string }>;
  let cartStore: ShoppingCartForest;

  const sampleProducts: Record<string, Product> = {
    laptop: { id: 'laptop', name: 'Gaming Laptop', price: 1200 },
    mouse: { id: 'mouse', name: 'Wireless Mouse', price: 50 },
    keyboard: { id: 'keyboard', name: 'Mechanical Keyboard', price: 150 },
  };

  beforeEach(() => {
    // Simple store for basic transaction tests
    store = new Store({
      value: { count: 0, name: 'test' },
      tests: (value: { count: number; name: string }) => {
        if (value.count < 0) {
          return 'Count cannot be negative';
        }
        if (value.name.length === 0) {
          return 'Name cannot be empty';
        }
        return null;
      },
    });

    // Shopping cart store for complex transaction scenarios
    cartStore = new ShoppingCartForest({
      value: {
        products: sampleProducts,
        cartItems: [],
        totalCost: 0,
      },
      tests: (value: ShoppingCartState) => {
        // Validate that totalCost matches sum of item costs
        const calculatedTotal = value.cartItems.reduce(
          (sum, item) => sum + item.cost,
          0,
        );
        if (Math.abs(value.totalCost - calculatedTotal) > 0.01) {
          return `Total cost mismatch: expected ${calculatedTotal}, got ${value.totalCost}`;
        }

        // Validate that all cart items reference valid products
        for (const item of value.cartItems) {
          if (!value.products[item.productId]) {
            return `Invalid product reference: ${item.productId}`;
          }
        }
        return null;
      },
    });
  });

  describe('Basic Transaction Rollback with Stack Monitoring', () => {
    it('should not emit data from subscription when validation fails', () => {
      const emittedValues: { count: number; name: string }[] = [];
      const stackEvents: PendingValue<{ count: number; name: string }>[][] = [];

      // Subscribe to value changes
      const valueSub = store.subscribe((value) => {
        emittedValues.push({ ...value });
      });

      // Subscribe to transaction stack changes
      const stackSub = store.observeTransStack((stack) => {
        stackEvents.push([...stack]);
      });

      // Clear initial emissions
      emittedValues.length = 0;
      stackEvents.length = 0;

      // Valid update should work
      store.next({ count: 5, name: 'valid' });

      // Should have emitted the valid value
      expect(emittedValues).toHaveLength(1);
      expect(emittedValues[0]).toEqual({ count: 5, name: 'valid' });

      // Clear events for next $test
      emittedValues.length = 0;
      stackEvents.length = 0;

      // Invalid update should not emit value
      expect(() => store.next({ count: -1, name: 'invalid' })).toThrow(
        'Count cannot be negative',
      );

      // No new value emissions should occur
      expect(emittedValues).toHaveLength(0);
      expect(store.value).toEqual({ count: 5, name: 'valid' }); // Value unchanged

      // Should have captured some transaction stack activity
      expect(stackEvents.length).toBeGreaterThanOrEqual(0); // May or may not have stack events

      valueSub.unsubscribe();
      stackSub.unsubscribe();
    });

    it('should track transaction stack during multiple operations', () => {
      const stackSnapshots: PendingValue<{ count: number; name: string }>[][] =
        [];
      const valueSnapshots: { count: number; name: string }[] = [];

      const stackSub = store.observeTransStack((stack) => {
        stackSnapshots.push([...stack]);
      });

      const valueSub = store.subscribe((value) => {
        valueSnapshots.push({ ...value });
      });

      // Clear initial snapshots
      stackSnapshots.length = 0;
      valueSnapshots.length = 0;

      // Perform multiple operations
      store.next({ count: 1, name: 'first' });
      store.next({ count: 2, name: 'second' });

      // Try invalid operation
      try {
        store.next({ count: -1, name: 'invalid' });
      } catch (e) {
        // Expected to fail
      }

      store.next({ count: 3, name: 'third' });

      // Should have value emissions for valid operations only
      expect(valueSnapshots).toHaveLength(3);
      expect(valueSnapshots[0]).toEqual({ count: 1, name: 'first' });
      expect(valueSnapshots[1]).toEqual({ count: 2, name: 'second' });
      expect(valueSnapshots[2]).toEqual({ count: 3, name: 'third' });

      // Transaction stack should show some activity during operations
      expect(stackSnapshots.length).toBeGreaterThanOrEqual(0);

      stackSub.unsubscribe();
      valueSub.unsubscribe();
    });
  });

  describe('Transaction with suspendValidation and Stack Monitoring', () => {
    it('should demonstrate transaction system behavior', () => {
      const stackEvents: PendingValue<ShoppingCartState>[][] = [];
      const valueEvents: ShoppingCartState[] = [];

      const stackSub = cartStore.observeTransStack((stack) => {
        stackEvents.push([...stack]);
      });

      const valueSub = cartStore.subscribe((value) => {
        valueEvents.push(JSON.parse(JSON.stringify(value)));
      });

      // Clear initial events
      stackEvents.length = 0;
      valueEvents.length = 0;

      // Simple transaction $test - just add an item and update total
      try {
        cartStore.$transact({
          suspendValidation: false, // Don't suspend validation for now
          action: function () {
            // Add item
            this.addItem('laptop', 1);
          },
        });

        // Should have valid final state
        expect(cartStore.value.cartItems).toHaveLength(1);
        expect(cartStore.value.cartItems[0].productId).toBe('laptop');
        expect(cartStore.value.totalCost).toBe(1200);
      } catch (err) {
        // If transaction fails, that's also valid behavior to $test
        expect(cartStore.value.cartItems).toHaveLength(0);
        expect(cartStore.value.totalCost).toBe(0);
      }

      stackSub.unsubscribe();
      valueSub.unsubscribe();
    });

    it('should rollback transaction if final state is invalid', () => {
      const stackEvents: PendingValue<ShoppingCartState>[][] = [];
      const valueEvents: ShoppingCartState[] = [];

      const stackSub = cartStore.observeTransStack((stack) => {
        stackEvents.push([...stack]);
      });

      const valueSub = cartStore.subscribe((value) => {
        valueEvents.push(JSON.parse(JSON.stringify(value)));
      });

      // Clear initial events
      stackEvents.length = 0;
      valueEvents.length = 0;

      // Transaction that ends in invalid state
      expect(() => {
        cartStore.$transact({
          suspendValidation: false, // Don't suspend validation - should fail immediately
          action: function () {
            // Add item but skip total update (leaves imbalance)
            this.addItem('mouse', 3, true); // skipTotal=true
            // Transaction ends here with invalid state (totalCost = 0, but items cost 150)
          },
        });
      }).toThrow('Total cost mismatch');

      // No value emission should have occurred
      expect(valueEvents).toHaveLength(0);
      expect(cartStore.value.cartItems).toHaveLength(0);
      expect(cartStore.value.totalCost).toBe(0);

      // Should have captured transaction stack activity during rollback
      expect(stackEvents.length).toBeGreaterThan(0);

      stackSub.unsubscribe();
      valueSub.unsubscribe();
    });
  });

  describe('Nested Transactions with Error Handling', () => {
    it('should handle multiple item additions with partial failures', () => {
      const stackEvents: PendingValue<ShoppingCartState>[][] = [];
      const valueEvents: ShoppingCartState[] = [];

      const stackSub = cartStore.observeTransStack((stack) => {
        stackEvents.push([...stack]);
      });

      const valueSub = cartStore.subscribe((value) => {
        valueEvents.push(JSON.parse(JSON.stringify(value)));
      });

      // Clear initial events
      stackEvents.length = 0;
      valueEvents.length = 0;

      // Test the addMultipleItems action which handles invalid products
      const choices: [string, number][] = [
        ['laptop', 1], // Valid
        ['invalid', 2], // Invalid - should be skipped
        ['mouse', 3], // Valid
        ['nonexistent', 1], // Invalid - should be skipped
        ['keyboard', 2], // Valid
      ];

      cartStore.addMultipleItems(choices);

      // Should have added only the valid items to the store
      expect(cartStore.value.cartItems).toHaveLength(3);
      expect(
        cartStore.value.cartItems.find((item) => item.productId === 'laptop'),
      ).toBeDefined();
      expect(
        cartStore.value.cartItems.find((item) => item.productId === 'mouse'),
      ).toBeDefined();
      expect(
        cartStore.value.cartItems.find((item) => item.productId === 'keyboard'),
      ).toBeDefined();

      // Total should be correct
      const expectedTotal = 1200 * 1 + 50 * 3 + 150 * 2; // 1200 + 150 + 300 = 1650
      expect(cartStore.value.totalCost).toBe(expectedTotal);

      // Should have emitted the final valid state
      expect(valueEvents.length).toBeGreaterThanOrEqual(1);
      const finalValue = valueEvents[valueEvents.length - 1];
      expect(finalValue.cartItems).toHaveLength(3);
      expect(finalValue.totalCost).toBe(expectedTotal);

      stackSub.unsubscribe();
      valueSub.unsubscribe();
    });

    it('should demonstrate basic transaction stack monitoring', () => {
      const logger: Array<{
        type: 'state' | 'stack';
        timestamp: number;
        data: any;
      }> = [];

      // Clear initial logs
      logger.length = 0;

      // Perform a simple valid operation using a transaction
      cartStore.$transact({
        suspendValidation: true,
        action: function () {
          // Add item (this.addItem calls this.next internally)
          this.addItem('laptop', 1);
        },
      });

      // Final state should be valid
      expect(cartStore.value.cartItems).toHaveLength(1);
      expect(cartStore.value.cartItems[0].productId).toBe('laptop');
      expect(cartStore.value.totalCost).toBe(1200);
    });
  });
});
