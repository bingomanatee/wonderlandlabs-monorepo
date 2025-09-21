// Auto-generated snippet from: apps/forestry4-docs/src/__tests__/shopping-cart-example.test.ts
// Description: Shopping cart store example unit tests
// Last synced: Sun Sep 21 14:32:36 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { describe, it, expect, vi } from 'vitest';
import shoppingCartStoreFactory from '../storeFactories/ValidationSystem/shoppingCartStore';

describe('Shopping Cart Store', () => {
  it('should create a store with initial empty state', () => {
    const store = shoppingCartStoreFactory();

    expect(store.value.items).toEqual([]);
    expect(store.value.totalCost).toBe(0);
  });

  it('should add items to cart', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);
    
    expect(store.value.items).toHaveLength(1);
    expect(store.value.items[0]).toEqual({
      productId: 'laptop',
      quantity: 1
    });
    expect(store.value.totalCost).toBe(1299.99); // Price from PRODUCTS constant
  });

  it('should update quantity when adding existing item', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);
    store.$.addItem('laptop', 2);
    
    expect(store.value.items).toHaveLength(1);
    expect(store.value.items[0].quantity).toBe(3);
  });

  it('should remove items from cart', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);
    store.$.addItem('mouse', 1);
    
    expect(store.value.items).toHaveLength(2);
    
    store.$.removeItem('laptop');
    
    expect(store.value.items).toHaveLength(1);
    expect(store.value.items[0].productId).toBe('mouse');
  });

  it('should update item quantities', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);
    store.$.updateQuantity('laptop', 3);
    
    expect(store.value.items[0].quantity).toBe(3);
    expect(store.value.totalCost).toBeCloseTo(3899.97, 2); // 3 * 1299.99
  });

  it('should clear cart', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);
    store.$.addItem('mouse', 2);
    
    expect(store.value.items).toHaveLength(2);
    
    store.$.clearCart();
    
    expect(store.value.items).toEqual([]);
    expect(store.value.totalCost).toBe(0);
  });

  it('should handle validation errors for invalid products', () => {
    const store = shoppingCartStoreFactory();
    
    expect(() => {
      store.$.addItem('invalid-product', 1);
    }).toThrow('Cart contains products that no longer exist');
  });

  it('should handle validation errors for stock limits', () => {
    const store = shoppingCartStoreFactory();
    
    expect(() => {
      store.$.addItem('laptop', 10); // Only 5 in stock
    }).toThrow('Cannot add more items than available in stock');
  });

  it('should handle validation errors for zero quantities', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);
    
    expect(() => {
      store.$.updateQuantity('laptop', 0);
    }).toThrow('Cart cannot contain items with zero or negative quantities');
  });

  it('should handle safe actions with error handler', () => {
    const mockErrorHandler = vi.fn();
    const store = shoppingCartStoreFactory(mockErrorHandler);
    
    // This should call the error handler instead of throwing
    store.$.safeAddItem('invalid-product', 1);
    
    expect(mockErrorHandler).toHaveBeenCalledWith(
      expect.any(Error),
      'Cannot Add Item'
    );
  });

  it('should handle addItemFromEvent action', () => {
    const store = shoppingCartStoreFactory();
    
    const mockEvent = {
      currentTarget: {
        dataset: {
          productId: 'laptop',
          quantity: '2'
        }
      }
    } as any;
    
    store.$.addItemFromEvent(mockEvent);
    
    expect(store.value.items).toHaveLength(1);
    expect(store.value.items[0]).toEqual({
      productId: 'laptop',
      quantity: 2
    });
  });

  it('should calculate total cost correctly with multiple items', () => {
    const store = shoppingCartStoreFactory();
    
    store.$.addItem('laptop', 1);  // 1299.99
    store.$.addItem('mouse', 2);   // 49.99 * 2 = 99.98
    store.$.addItem('keyboard', 1); // 129.99
    
    const expectedTotal = 1299.99 + 99.98 + 129.99;
    expect(store.value.totalCost).toBeCloseTo(expectedTotal, 2);
  });
});
