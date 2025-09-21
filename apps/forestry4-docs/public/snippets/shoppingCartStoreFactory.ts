// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/ValidationSystem/shoppingCartStore.ts
// Description: Shopping cart store with validation, coupons, tax calculation, and checkout processing
// Last synced: Sat Sep 20 18:53:39 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';
import { CartItem, ShoppingCart } from '@/types.ts';
import { PRODUCTS } from '@/constants.ts';

type ErrorHandler = (error: Error | string, title?: string) => void;

// Modern Forestry 4.1.x class extension pattern
class ShoppingCartForest extends Forest<ShoppingCart> {
  constructor(private handleError?: ErrorHandler) {
    super({
      name: 'shopping-cart',
      value: { items: [], totalCost: 0 },
      tests: [
        // Critical business rule - No duplicate products (quantum constraint)
        function (value: ShoppingCart) {
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
        function (value: ShoppingCart) {
          const outOfStock = value.items.filter((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            return product && item.quantity > product.inStock;
          });
          return outOfStock.length > 0 ? 'Cannot add more items than available in stock' : null;
        },

        // Critical business rule - Total cost must be accurate (financial integrity)
        function (value: ShoppingCart) {
          const expectedTotal = value.items.reduce((sum, item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            return sum + (product ? product.price * item.quantity : 0);
          }, 0);

          return Math.abs(value.totalCost - expectedTotal) > 0.01
            ? 'Total cost calculation is incorrect - financial integrity violation'
            : null;
        },

        // Critical business rule - Cart cannot be too large (system constraint)
        function (value: ShoppingCart) {
          const totalItems = value.items.reduce((sum, item) => sum + item.quantity, 0);
          return totalItems > 100 ? 'Cart cannot contain more than 100 total items' : null;
        },
      ],
    });
  }

  // Basic cart operations
  addItem(productId: string, quantity: number) {
    const existingIndex = this.value.items.findIndex((item) => item.productId === productId);

    this.mutate((draft) => {
      if (existingIndex >= 0) {
        // Update existing item quantity
        draft.items[existingIndex].quantity += quantity;
      } else {
        // Add new item
        draft.items.push({ productId, quantity });
      }
    });
  }

  // Event-centric action that extracts data from click events
  addItemFromEvent(event: React.MouseEvent<HTMLElement>) {
    const element = event.currentTarget;
    const productId = element.dataset.productId;
    const quantity = parseInt(element.dataset.quantity || '1');

    if (!productId) {
      console.error('addItemFromEvent: missing data-product-id attribute');
      return;
    }

    // Delegate to the main addItem action
    this.addItem(productId, quantity);
  }

  removeItem(productId: string) {
    this.mutate((draft) => {
      draft.items = draft.items.filter((item) => item.productId !== productId);
    });
  }

  updateQuantity(productId: string, quantity: number) {
    this.mutate((draft) => {
      const item = draft.items.find((item) => item.productId === productId);
      if (item) {
        item.quantity = quantity;
      }
    });
  }

  // Semantic action for updating product quantity from form input
  updateProduct(productId: string, quantity: number) {
    this.updateQuantity(productId, quantity);
  }

  clearCart() {
    this.mutate((draft) => {
      draft.items = [];
      draft.totalCost = 0;
    });
  }

  // Safe actions that catch validation errors and show toasts
  safeAddItemFromEvent(event: React.MouseEvent<HTMLElement>) {
    if (!this.handleError) {
      return this.addItemFromEvent(event);
    }

    try {
      this.addItemFromEvent(event);
    } catch (error) {
      this.handleError(error as Error, 'Cannot Add Item');
    }
  }

  safeUpdateQuantity(productId: string, quantity: number) {
    if (!this.handleError) {
      return this.updateQuantity(productId, quantity);
    }

    try {
      this.updateQuantity(productId, quantity);
    } catch (error) {
      this.handleError(error as Error, 'Cannot Update Quantity');
    }
  }

  safeUpdateProduct(productId: string, quantity: number) {
    if (!this.handleError) {
      return this.updateProduct(productId, quantity);
    }

    try {
      this.updateProduct(productId, quantity);
    } catch (error) {
      this.handleError(error as Error, 'Cannot Update Quantity');
    }
  }

  safeAddItem(productId: string, quantity: number) {
    if (!this.handleError) {
      return this.addItem(productId, quantity);
    }

    try {
      this.addItem(productId, quantity);
    } catch (error) {
      this.handleError(error as Error, 'Cannot Add Item');
    }
  }

  // Prep function for computed properties
  prep(input: Partial<ShoppingCart>, current: ShoppingCart): ShoppingCart {
    const items = input.items || current.items;
    // Calculate total cost in prep function
    const totalCost = items.reduce((sum, item) => {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    return { items, totalCost };
  }
}

// Factory function for useForestryLocal compatibility
export default function shoppingCartForestFactory(handleError?: ErrorHandler) {
  return new ShoppingCartForest(handleError);
}

export type { ShoppingCart, CartItem };
export { ShoppingCartForest };
