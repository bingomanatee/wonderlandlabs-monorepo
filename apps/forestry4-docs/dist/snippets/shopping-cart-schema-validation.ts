// Auto-generated snippet from: apps/forestry4-docs/src/examples/shopping-cart/schema-validation.ts
// Description: Zod schema definitions and custom business logic tests for shopping cart validation
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { z } from 'zod';

const CartItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  category: z.enum(['electronics', 'clothing', 'books', 'home']),
});

const ShoppingCartSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
  tax: z.number().nonnegative('Tax cannot be negative'),
  shipping: z.number().nonnegative('Shipping cannot be negative'),
  discount: z.number().nonnegative('Discount cannot be negative'),
  total: z.number().nonnegative('Total cannot be negative'),
  couponCode: z.string().optional(),
});

// Custom business logic tests
const cartTests = [
  (cart: CartState) => {
    // Check inventory availability
    const outOfStock = cart.items.find((item) => getInventory(item.id) < item.quantity);
    if (outOfStock) {
      return `${outOfStock.name} is out of stock`;
    }
    return null;
  },

  (cart: CartState) => {
    // Validate discount eligibility
    if (cart.discount > 0 && cart.subtotal < 50) {
      return 'Minimum order of $50 required for discounts';
    }
    return null;
  },

  (cart: CartState) => {
    // Check maximum cart size
    if (cart.items.length > 20) {
      return 'Maximum 20 items allowed in cart';
    }
    return null;
  },
];

export { CartItemSchema, ShoppingCartSchema, cartTests };
