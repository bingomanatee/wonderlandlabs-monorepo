import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Forest } from './Forest';
import { ForestBranch } from './ForestBranch';
import { Store } from './Store';
import type { ActionParamsRecord, ActionExposedRecord } from '../types';
import { previewActionSignatures } from './helpers';

// Test data types
interface User {
  id: string;
  name: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface Purchase {
  productId: string;
  quantity: number;
}

interface ShoppingCart {
  userId: string;
  purchases: Purchase[];
}

interface StoreData {
  users: Record<string, User>;
  products: Record<string, Product>;
  shoppingCart: ShoppingCart;
}

// Define the cart action types
interface CartActions extends ActionExposedRecord {
  addItem: (productId: string, quantity?: number) => ShoppingCart;
  removeItem: (productId: string) => ShoppingCart;
  updateQuantity: (productId: string, quantity: number) => ShoppingCart;
  clearCart: () => ShoppingCart;
  totalCartCost: () => number;
}

interface UserActions extends ActionExposedRecord {
  addUser: (user: User) => Record<string, User>;
}

interface ProductActions extends ActionExposedRecord {
  updatePrice: (productId: string, newPrice: number) => Record<string, Product>;
}

describe('Forest and ForestBranch Integration', () => {
  let forest: Forest<StoreData>;
  let cartTree: ForestBranch<ShoppingCart, CartActions>;

  const sampleUsers: Record<string, User> = {
    user1: { id: 'user1', name: 'Alice', email: 'alice@example.com' },
    user2: { id: 'user2', name: 'Bob', email: 'bob@example.com' },
  };

  const sampleProducts: Record<string, Product> = {
    prod1: {
      id: 'prod1',
      name: 'Laptop',
      price: 999.99,
      category: 'Electronics',
    },
    prod2: {
      id: 'prod2',
      name: 'Mouse',
      price: 29.99,
      category: 'Electronics',
    },
    prod3: { id: 'prod3', name: 'Book', price: 19.99, category: 'Books' },
  };

  const initialCart: ShoppingCart = {
    userId: 'user1',
    purchases: [
      { productId: 'prod1', quantity: 1 },
      { productId: 'prod2', quantity: 2 },
    ],
  };

  const initialData: StoreData = {
    users: sampleUsers,
    products: sampleProducts,
    shoppingCart: initialCart,
  };

  beforeEach(() => {
    // Create the main forest store
    forest = new Forest<StoreData>({
      value: initialData,
      actions: {},
      name: 'ecommerce-store',
    });

    // Create cart actions with totalCartCost computation
    const cartActions: ActionParamsRecord = {
      addItem: (
        cart: ShoppingCart,
        productId: string,
        quantity: number = 1,
      ) => {
        const existingIndex = cart.purchases.findIndex(
          (p) => p.productId === productId,
        );
        if (existingIndex >= 0) {
          return {
            ...cart,
            purchases: cart.purchases.map((p, i) =>
              i === existingIndex
                ? { ...p, quantity: p.quantity + quantity }
                : p,
            ),
          };
        } else {
          return {
            ...cart,
            purchases: [...cart.purchases, { productId, quantity }],
          };
        }
      },

      removeItem: (cart: ShoppingCart, productId: string) => {
        return {
          ...cart,
          purchases: cart.purchases.filter((p) => p.productId !== productId),
        };
      },

      updateQuantity: (
        cart: ShoppingCart,
        productId: string,
        quantity: number,
      ) => {
        if (quantity <= 0) {
          return {
            ...cart,
            purchases: cart.purchases.filter((p) => p.productId !== productId),
          };
        }
        return {
          ...cart,
          purchases: cart.purchases.map((p) =>
            p.productId === productId ? { ...p, quantity } : p,
          ),
        };
      },

      clearCart: (cart: ShoppingCart) => {
        return {
          ...cart,
          purchases: [],
        };
      },

      // Computed action: totalCartCost
      totalCartCost: function (
        this: ForestBranch<ShoppingCart>,
        cart: ShoppingCart,
      ) {
        const products = (this.root.value as StoreData).products;
        return cart.purchases.reduce((total, purchase) => {
          const product = products[purchase.productId];
          if (product && purchase.productId && purchase.quantity > 0) {
            return total + product.price * purchase.quantity;
          }
          return total;
        }, 0);
      },
    };

    // Create a ForestBranch for the shopping cart with proper type hints
    cartTree = forest.branch<ShoppingCart, CartActions>(['shoppingCart'], {
      actions: cartActions,
    });
  });

  describe('Forest Store', () => {
    it('should initialize with correct data structure', () => {
      expect(forest.value.users).toEqual(sampleUsers);
      expect(forest.value.products).toEqual(sampleProducts);
      expect(forest.value.shoppingCart).toEqual(initialCart);
    });

    it('should be the root store', () => {
      expect(forest.isRoot).toBe(true);
      expect(forest.parent).toBeNull();
      expect(forest.path).toEqual([]);
    });

    it('should allow setting nested values', () => {
      const newUser: User = {
        id: 'user3',
        name: 'Charlie',
        email: 'charlie@example.com',
      };

      forest.set(newUser, ['users', 'user3']);

      expect(forest.value.users.user3).toEqual(newUser);
    });

    it('should create branches for nested data', () => {
      const usersTree = forest.branch<Record<string, User>>(['users'], {
        actions: {},
      });

      expect(usersTree).toBeInstanceOf(ForestBranch);
      expect(usersTree.path).toEqual(['users']);
      expect(usersTree.parent).toBe(forest);
      expect(usersTree.value).toEqual(sampleUsers);
    });
  });

  describe('ForestBranch (Shopping Cart)', () => {
    it('should be properly connected to parent forest', () => {
      expect(cartTree.parent).toBe(forest);
      expect(cartTree.path).toEqual(['shoppingCart']);
      expect(cartTree.isRoot).toBe(false);
      expect(cartTree.root).toBe(forest);
    });

    it('should reflect the current cart value', () => {
      expect(cartTree.value).toEqual(initialCart);
      expect(cartTree.value.userId).toBe('user1');
      expect(cartTree.value.purchases).toHaveLength(2);
    });

    it('should update parent when cart changes', () => {
      const newCart: ShoppingCart = {
        userId: 'user2',
        purchases: [{ productId: 'prod3', quantity: 1 }],
      };

      cartTree.next(newCart);

      expect(forest.value.shoppingCart).toEqual(newCart);
      expect(cartTree.value).toEqual(newCart);
    });

    it('should have reactive subject that updates with parent changes', () => {
      const listener = vi.fn();
      cartTree.subscribe(listener);

      // Clear the initial subscription call
      listener.mockClear();

      // Update cart through forest
      const updatedCart = { ...initialCart, userId: 'user2' };
      forest.set(updatedCart, ['shoppingCart']);

      expect(listener).toHaveBeenCalledWith(updatedCart);
    });
  });

  describe('Shopping Cart Actions', () => {
    it('should add new items to cart', () => {
      const result = cartTree.$.addItem('prod3', 1);

      expect(result.purchases).toHaveLength(3);
      expect(result.purchases[2]).toEqual({ productId: 'prod3', quantity: 1 });
    });

    it('should increase quantity for existing items', () => {
      const result = cartTree.$.addItem('prod1', 2);

      expect(result.purchases).toHaveLength(2);
      expect(result.purchases[0].quantity).toBe(3); // 1 + 2
    });

    it('should remove items from cart', () => {
      const result = cartTree.$.removeItem('prod1');

      expect(result.purchases).toHaveLength(1);
      expect(result.purchases[0].productId).toBe('prod2');
    });

    it('should update item quantities', () => {
      const result = cartTree.$.updateQuantity('prod2', 5);

      expect(result.purchases[1].quantity).toBe(5);
    });

    it('should remove items when quantity is set to 0', () => {
      const result = cartTree.$.updateQuantity('prod1', 0);

      expect(result.purchases).toHaveLength(1);
      expect(result.purchases[0].productId).toBe('prod2');
    });

    it('should clear all items from cart', () => {
      const result = cartTree.$.clearCart();

      expect(result.purchases).toHaveLength(0);
      expect(result.userId).toBe('user1'); // userId should remain
    });
  });

  describe('Total Cart Cost Computation', () => {
    it('should calculate correct total for initial cart', () => {
      const total = cartTree.$.totalCartCost();

      // prod1: 999.99 * 1 = 999.99
      // prod2: 29.99 * 2 = 59.98
      // Total: 1059.97
      expect(total).toBeCloseTo(1059.97, 2);
    });

    it('should calculate total for empty cart', () => {
      // First update the cart to be empty
      const emptyCart = cartTree.$.clearCart();
      cartTree.next(emptyCart);

      const total = cartTree.$.totalCartCost();

      expect(total).toBe(0);
    });

    it('should handle missing products gracefully', () => {
      const cartWithMissingProduct: ShoppingCart = {
        userId: 'user1',
        purchases: [
          { productId: 'prod1', quantity: 1 },
          { productId: 'nonexistent', quantity: 2 },
        ],
      };

      cartTree.next(cartWithMissingProduct);
      const total = cartTree.$.totalCartCost();

      // Should only count prod1: 999.99 * 1 = 999.99
      expect(total).toBeCloseTo(999.99, 2);
    });

    it('should recalculate when cart is updated', () => {
      // Add an expensive item
      const updatedCart = cartTree.$.addItem('prod1', 1);
      cartTree.next(updatedCart);

      const newTotal = cartTree.$.totalCartCost();

      // prod1: 999.99 * 2 = 1999.98
      // prod2: 29.99 * 2 = 59.98
      // Total: 2059.96
      expect(newTotal).toBeCloseTo(2059.96, 2);
    });

    it('should work with updated product prices', () => {
      // Update product price in the forest
      const updatedProducts = {
        ...forest.value.products,
        prod1: { ...forest.value.products.prod1, price: 1200.0 },
      };

      forest.set(updatedProducts, ['products']);

      const total = cartTree.$.totalCartCost();

      // prod1: 1200.00 * 1 = 1200.00
      // prod2: 29.99 * 2 = 59.98
      // Total: 1259.98
      expect(total).toBeCloseTo(1259.98, 2);
    });
  });

  describe('Complex Integration Scenarios', () => {
    it('should handle multiple ForestTree branches', () => {
      const usersTree = forest.branch<Record<string, User>, UserActions>(
        ['users'],
        {
          actions: {
            addUser: (users: Record<string, User>, user: User) => ({
              ...users,
              [user.id]: user,
            }),
          },
        },
      );

      const productsTree = forest.branch<
        Record<string, Product>,
        ProductActions
      >(['products'], {
        actions: {
          updatePrice: (
            products: Record<string, Product>,
            productId: string,
            newPrice: number,
          ) => ({
            ...products,
            [productId]: { ...products[productId], price: newPrice },
          }),
        },
      });

      // Test that changes in one branch affect calculations in another
      const newUser: User = {
        id: 'user3',
        name: 'Charlie',
        email: 'charlie@example.com',
      };
      const updatedUsers = usersTree.$.addUser(newUser);
      usersTree.next(updatedUsers);

      const updatedProducts = productsTree.$.updatePrice('prod1', 1500.0);
      productsTree.next(updatedProducts);

      // Verify forest state is updated
      expect(forest.value.users.user3).toEqual(newUser);
      expect(forest.value.products.prod1.price).toBe(1500.0);

      // Verify cart total reflects new price
      const total = cartTree.$.totalCartCost();
      expect(total).toBeCloseTo(1559.98, 2); // 1500 + 59.98
    });

    it('should handle nested path updates through ForestTree', () => {
      // Update a specific purchase quantity through nested path
      cartTree.set(5, ['purchases', '0', 'quantity']);

      expect(forest.value.shoppingCart.purchases[0].quantity).toBe(5);

      const total = cartTree.$.totalCartCost();
      // prod1: 999.99 * 5 = 4999.95
      // prod2: 29.99 * 2 = 59.98
      expect(total).toBeCloseTo(5059.93, 2);
    });

    it('should maintain reactivity across multiple subscribers', () => {
      const forestListener = vi.fn();
      const cartListener = vi.fn();

      forest.subscribe(forestListener);
      cartTree.subscribe(cartListener);

      // Clear initial calls
      forestListener.mockClear();
      cartListener.mockClear();

      // Update cart through action
      const newCart = cartTree.$.addItem('prod3', 3);
      cartTree.next(newCart);

      // Both should be notified
      expect(forestListener).toHaveBeenCalled();
      expect(cartListener).toHaveBeenCalledWith(newCart);
    });

    it('should handle complex cart operations with cost tracking', () => {
      let currentCart = cartTree.value;

      // Add multiple items
      currentCart = cartTree.$.addItem('prod3', 2);
      cartTree.next(currentCart);

      currentCart = cartTree.$.addItem('prod1', 1); // Increase existing
      cartTree.next(currentCart);

      // Verify final state
      expect(cartTree.value.purchases).toHaveLength(3);
      expect(cartTree.value.purchases[0].quantity).toBe(2); // prod1: 1 + 1
      expect(cartTree.value.purchases[2].quantity).toBe(2); // prod3: new item

      // Calculate expected total
      const expectedTotal = 999.99 * 2 + 29.99 * 2 + 19.99 * 2;
      const actualTotal = cartTree.$.totalCartCost();
      expect(actualTotal).toBeCloseTo(expectedTotal, 2);
    });

    it('should handle error scenarios gracefully', () => {
      // Test with invalid path
      expect(() => {
        cartTree.set('invalid', ['nonexistent', 'path']);
      }).not.toThrow(); // Should create the path structure

      // Test totalCartCost with corrupted data
      const corruptedCart: ShoppingCart = {
        userId: 'user1',
        purchases: [
          { productId: 'prod1', quantity: 1 },
          { productId: '', quantity: 2 }, // Empty product ID
          { productId: 'prod2', quantity: -1 }, // Negative quantity
        ],
      };

      cartTree.next(corruptedCart);
      const total = cartTree.$.totalCartCost();
      // Should handle gracefully, only counting valid entries
      expect(total).toBeCloseTo(999.99, 2); // Only prod1
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with subscriptions', () => {
      const subscriptions = [];

      // Create multiple subscriptions
      for (let i = 0; i < 10; i++) {
        const sub = cartTree.subscribe(() => {});
        subscriptions.push(sub);
      }

      // Unsubscribe all
      subscriptions.forEach((sub) => sub.unsubscribe());

      // Should not throw or cause issues
      cartTree.next({ ...cartTree.value, userId: 'user2' });
      expect(cartTree.value.userId).toBe('user2');
    });

    it('should handle large cart operations efficiently', () => {
      let cart = cartTree.value;

      // Add many items
      const startTime = Date.now();
      for (let i = 0; i < 100; i++) {
        cart = cartTree.$.addItem('prod1', 1);
        cartTree.next(cart);
        cart = cartTree.value; // Get updated value
      }
      const endTime = Date.now();

      // Should complete quickly (less than 100ms for 100 operations)
      expect(endTime - startTime).toBeLessThan(100);
      expect(cart.purchases[0].quantity).toBe(101); // 1 initial + 100 added
    });
  });

  describe('Action Signature Transformation', () => {
    it('should demonstrate how ActionParamsRecord transforms to ActionExposedRecord', () => {
      // Define actions with value as first parameter (ActionParamsRecord)
      const inputActions: ActionParamsRecord = {
        addItem: (cart: ShoppingCart, productId: string, quantity: number) => {
          return {
            ...cart,
            purchases: [...cart.purchases, { productId, quantity }],
          };
        },
        removeItem: (cart: ShoppingCart, productId: string) => {
          return {
            ...cart,
            purchases: cart.purchases.filter((p) => p.productId !== productId),
          };
        },
        clearCart: (cart: ShoppingCart) => {
          return { ...cart, purchases: [] };
        },
        totalCost: (cart: ShoppingCart) => {
          return cart.purchases.reduce(
            (total, p) => total + p.quantity * 10,
            0,
          );
        },
      };

      // Preview what the exposed signatures will look like
      const exposedActions = previewActionSignatures(inputActions);

      // The exposed actions should have the value parameter removed
      expect(exposedActions.addItem.length).toBe(2); // productId, quantity (cart removed)
      expect(exposedActions.removeItem.length).toBe(1); // productId (cart removed)
      expect(exposedActions.clearCart.length).toBe(0); // no params (cart removed)
      expect(exposedActions.totalCost.length).toBe(0); // no params (cart removed)

      // Verify the functions exist but throw when called (they're for type inspection only)
      expect(() => exposedActions.addItem('prod1', 2)).toThrow(
        'previewActionSignatures is for type inspection only',
      );
      expect(() => exposedActions.removeItem('prod1')).toThrow(
        'previewActionSignatures is for type inspection only',
      );
      expect(() => exposedActions.clearCart()).toThrow(
        'previewActionSignatures is for type inspection only',
      );
      expect(() => exposedActions.totalCost()).toThrow(
        'previewActionSignatures is for type inspection only',
      );
    });

    it('should show the actual working transformation in a real store', () => {
      // Create a simple store to demonstrate the transformation
      const inputActions: ActionParamsRecord = {
        addItem: (
          cart: ShoppingCart,
          productId: string,
          quantity: number = 1,
        ) => {
          const existingIndex = cart.purchases.findIndex(
            (p) => p.productId === productId,
          );
          if (existingIndex >= 0) {
            return {
              ...cart,
              purchases: cart.purchases.map((p, i) =>
                i === existingIndex
                  ? { ...p, quantity: p.quantity + quantity }
                  : p,
              ),
            };
          } else {
            return {
              ...cart,
              purchases: [...cart.purchases, { productId, quantity }],
            };
          }
        },
      };

      // Create a branch with these actions
      const testBranch = forest.branch<ShoppingCart, CartActions>(
        ['shoppingCart'],
        {
          actions: inputActions,
        },
      );

      // The actual exposed action should work without passing the cart value
      const result = testBranch.$.addItem('prod3', 3);

      // Verify the transformation worked correctly
      expect(result.purchases).toHaveLength(3);
      expect(result.purchases[2]).toEqual({ productId: 'prod3', quantity: 3 });

      // The original cart should have the value automatically injected
      expect(result.userId).toBe('user1'); // Preserved from original cart
    });
  });

  describe('Type System Verification', () => {
    it('should demonstrate correct type flow: input actions -> exposed actions', () => {
      // Define input actions (with value parameter) - this is what developers write
      const inputActions = {
        addItem: (cart: ShoppingCart, productId: string, quantity: number) => ({
          ...cart,
          purchases: [...cart.purchases, { productId, quantity }],
        }),
        removeItem: (cart: ShoppingCart, productId: string) => ({
          ...cart,
          purchases: cart.purchases.filter((p) => p.productId !== productId),
        }),
      };

      // Create a branch - the Actions generic represents what will be exposed
      interface ExposedCartActions extends ActionExposedRecord {
        addItem: (productId: string, quantity: number) => ShoppingCart;
        removeItem: (productId: string) => ShoppingCart;
      }

      const typedCartTree = forest.branch<ShoppingCart, ExposedCartActions>(
        ['shoppingCart'],
        {
          actions: inputActions, // Input: actions with value parameter
        },
      );

      // The exposed actions should NOT require the value parameter
      const result = typedCartTree.$.addItem('prod4', 5); // ✅ No cart parameter needed!

      expect(result.purchases).toHaveLength(3);
      expect(result.purchases[2]).toEqual({ productId: 'prod4', quantity: 5 });

      // Verify the transformation worked - the original cart value was automatically injected
      expect(result.userId).toBe('user1'); // Preserved from original cart
    });

    it('should show that Actions generic represents the exposed interface', () => {
      // The Store/Forest/ForestBranch classes use Actions to represent what users see
      // StoreParams.actions uses RecordToParams<Actions> to represent what developers write

      interface MyExposedActions extends ActionExposedRecord {
        increment: () => number;
        add: (amount: number) => number;
      }

      // Input actions (what developer writes - with value parameter)
      const inputActions = {
        increment: (value: number) => value + 1,
        add: (value: number, amount: number) => value + amount,
      };

      // Create store with explicit typing
      const numberStore = new Store<number, MyExposedActions>({
        value: 10,
        actions: inputActions, // TypeScript ensures this matches RecordToParams<MyExposedActions>
      });

      // Exposed actions don't need value parameter
      const result1 = numberStore.$.increment();
      expect(result1).toBe(11); // 10 + 1

      const result2 = numberStore.$.add(5);
      expect(result2).toBe(15); // 10 + 5 (original value, actions don't auto-update store)

      // Actions return new values but don't automatically update the store
      expect(numberStore.value).toBe(10); // Original value unchanged
    });
  });
});
