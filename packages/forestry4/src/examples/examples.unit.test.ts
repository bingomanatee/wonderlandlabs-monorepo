import { describe, it, expect } from 'vitest';
import { CounterForest } from './CounterForest';
import { ShoppingAppForest } from './ShoppingCartForest';

describe('Forestry 4.0 Subclassing Examples', () => {
  describe('CounterForest', () => {
    it('should initialize with default value', () => {
      const counter = new CounterForest();
      expect(counter.value).toBe(0);
      expect(counter.$name).toBe('counter');
    });

    it('should initialize with custom value', () => {
      const counter = new CounterForest(10);
      expect(counter.value).toBe(10);
    });

    it('should increment value', () => {
      const counter = new CounterForest(5);
      counter.increment();
      expect(counter.value).toBe(6);
    });

    it('should decrement value', () => {
      const counter = new CounterForest(5);
      counter.decrement();
      expect(counter.value).toBe(4);
    });

    it('should add amount', () => {
      const counter = new CounterForest(5);
      counter.add(3);
      expect(counter.value).toBe(8);
    });

    it('should throw error for non-number amount', () => {
      const counter = new CounterForest();
      expect(() => counter.add('invalid' as any)).toThrow('Amount must be a number');
    });

    it('should reset to zero', () => {
      const counter = new CounterForest(42);
      counter.reset();
      expect(counter.value).toBe(0);
    });

    it('should check if positive', () => {
      const counter = new CounterForest(5);
      expect(counter.isPositive()).toBe(true);
      
      counter.reset();
      expect(counter.isPositive()).toBe(false);
    });

    it('should check if negative', () => {
      const counter = new CounterForest(-5);
      expect(counter.isNegative()).toBe(true);
      
      counter.reset();
      expect(counter.isNegative()).toBe(false);
    });
  });

  describe('ShoppingAppForest', () => {
    it('should initialize with empty cart and user', () => {
      const app = new ShoppingAppForest();
      expect(app.value.cart.items).toEqual([]);
      expect(app.value.cart.total).toBe(0);
      expect(app.value.user.id).toBe('');
      expect(app.value.user.name).toBe('');
    });

    it('should set user information', () => {
      const app = new ShoppingAppForest();
      app.setUser('user123', 'John Doe');
      
      expect(app.value.user.id).toBe('user123');
      expect(app.value.user.name).toBe('John Doe');
    });

    it('should clear user information', () => {
      const app = new ShoppingAppForest();
      app.setUser('user123', 'John Doe');
      app.clearUser();
      
      expect(app.value.user.id).toBe('');
      expect(app.value.user.name).toBe('');
    });

    describe('Shopping Cart Branch', () => {
      it('should create cart branch with custom methods', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        expect(cart.value.items).toEqual([]);
        expect(cart.value.total).toBe(0);
        expect(cart.getItemCount()).toBe(0);
      });

      it('should add items to cart', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        cart.addItem('product1', 2, 10.99);
        
        expect(cart.value.items).toHaveLength(1);
        expect(cart.value.items[0]).toEqual({
          productId: 'product1',
          quantity: 2,
          price: 10.99
        });
        expect(cart.value.total).toBe(21.98);
        expect(cart.getItemCount()).toBe(2);
      });

      it('should increase quantity for existing items', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        cart.addItem('product1', 1, 10.00);
        cart.addItem('product1', 2, 10.00);
        
        expect(cart.value.items).toHaveLength(1);
        expect(cart.value.items[0].quantity).toBe(3);
        expect(cart.value.total).toBe(30.00);
      });

      it('should remove items from cart', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        cart.addItem('product1', 1, 10.00);
        cart.addItem('product2', 2, 5.00);
        cart.removeItem('product1');
        
        expect(cart.value.items).toHaveLength(1);
        expect(cart.value.items[0].productId).toBe('product2');
        expect(cart.value.total).toBe(10.00);
      });

      it('should update item quantities', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        cart.addItem('product1', 1, 10.00);
        cart.updateQuantity('product1', 5);
        
        expect(cart.value.items[0].quantity).toBe(5);
        expect(cart.value.total).toBe(50.00);
      });

      it('should remove items when quantity set to 0', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        cart.addItem('product1', 1, 10.00);
        cart.updateQuantity('product1', 0);
        
        expect(cart.value.items).toHaveLength(0);
        expect(cart.value.total).toBe(0);
      });

      it('should clear entire cart', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        cart.addItem('product1', 1, 10.00);
        cart.addItem('product2', 2, 5.00);
        cart.clearCart();
        
        expect(cart.value.items).toEqual([]);
        expect(cart.value.total).toBe(0);
      });

      it('should check if item exists', () => {
        const app = new ShoppingAppForest();
        const cart = app.getCartBranch();
        
        expect(cart.hasItem('product1')).toBe(false);
        
        cart.addItem('product1', 1, 10.00);
        expect(cart.hasItem('product1')).toBe(true);
        expect(cart.hasItem('product2')).toBe(false);
      });
    });
  });
});
