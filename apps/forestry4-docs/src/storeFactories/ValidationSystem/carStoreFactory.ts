import type { CartItem, ShoppingCart } from '@/types.ts';
import { PRODUCTS } from '@/constants.ts';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Modern Forestry 4.1.x class extension pattern
class CarForest extends Forest<ShoppingCart> {
  constructor() {
    super({
      name: 'shopping-cart',
      value: { items: [], totalCost: 0 },
      prep: (input: Partial<ShoppingCart>, current: ShoppingCart): ShoppingCart => {
        const items = input.items || current.items;
        // Calculate total cost in prep function
        const totalCost = items.reduce((sum, item) => {
          const product = PRODUCTS.find((p) => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        return { items, totalCost };
      },
      tests: [
        // Critical business rule - No duplicate products (quantum constraint)
        (value: ShoppingCart) => {
          const productIds = value.items.map((item) => item.productId);
          const uniqueIds = new Set(productIds);
          return productIds.length !== uniqueIds.size
            ? 'Cannot have the same product multiple times in cart - use quantity instead'
            : null;
        },

        // Critical business rule - No negative or zero quantities (should not be saved)
        (value: ShoppingCart) => {
          const invalidQuantities = value.items.filter((item) => item.quantity <= 0);
          return invalidQuantities.length > 0
            ? 'Cart cannot contain items with zero or negative quantities'
            : null;
        },

        // Critical business rule - No non-existent products (referential integrity)
        (value: ShoppingCart) => {
          const invalidItems = value.items.filter(
            (item) => !PRODUCTS.find((p) => p.id === item.productId)
          );
          return invalidItems.length > 0 ? 'Cart contains products that no longer exist' : null;
        },

        // Critical business rule - Cannot exceed available stock (inventory constraint)
        (value: ShoppingCart) => {
          const outOfStock = value.items.filter((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            return product && item.quantity > product.inStock;
          });
          return outOfStock.length > 0 ? 'Cannot add more items than available in stock' : null;
        },

        // Critical business rule - Total cost must be accurate (financial integrity)
        (value: ShoppingCart) => {
          const expectedTotal = value.items.reduce((sum, item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
          }, 0);

          return Math.abs(value.totalCost - expectedTotal) > 0.01
            ? 'Total cost calculation is incorrect - financial integrity violation'
            : null;
        },

        // Critical business rule - Cart cannot be too large (system constraint)
        (value: ShoppingCart) => {
          const totalItems = value.items.reduce((sum, item) => sum + item.quantity, 0);
          return totalItems > 100 ? 'Cart cannot contain more than 100 total items' : null;
        },
      ],
    });
  }

  addItem(productId: string, quantity: number) {
    const value = this.value;
    const existingIndex = value.items.findIndex((item) => item.productId === productId);
    let newItems: CartItem[];

    if (existingIndex >= 0) {
      newItems = value.items.map((item, index) =>
        index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      newItems = [...value.items, { productId, quantity }];
    }

    this.next({ ...value, items: newItems });
  }

  updateQuantity(productId: string, quantity: number) {
    const value = this.value;
    const newItems = value.items
      .map((item) => (item.productId === productId ? { ...item, quantity } : item))
      .filter((item) => item.quantity > 0);

    this.next({ ...value, items: newItems });
  }

  clearCart() {
    this.next({ items: [], totalCost: 0 });
  }
}
export default function carForestFactory() {
  return new CarForest();
}
