// Complete Shopping Cart Validation - All Three Layers
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Layer 1: Zod Schema for Type Safety and Structure
const CartItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().positive('Price must be positive'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  category: z.enum(['electronics', 'clothing', 'books', 'home']),
  inStock: z.boolean()
});

const ShoppingCartSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number().nonnegative('Subtotal cannot be negative'),
  tax: z.number().nonnegative('Tax cannot be negative'),
  shipping: z.number().nonnegative('Shipping cannot be negative'),
  discount: z.number().nonnegative('Discount cannot be negative'),
  total: z.number().nonnegative('Total cannot be negative'),
  couponCode: z.string().optional(),
  isProcessing: z.boolean().default(false),
  errors: z.array(z.string()).default([])
});

type CartState = z.infer<typeof ShoppingCartSchema>;

// Mock inventory system
const inventory = {
  'laptop-1': 5,
  'book-1': 10,
  'shirt-1': 0, // Out of stock
  'phone-1': 3
};

class ShoppingCartForest extends Forest<CartState> {
  constructor() {
    super({
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      couponCode: undefined,
      isProcessing: false,
      errors: []
    }, {
      name: 'ShoppingCart',
      schema: ShoppingCartSchema,
      
      // Layer 2: Test Functions for Critical Business Rules
      tests: {
        // Inventory validation
        inventoryCheck: (cart) => {
          const outOfStock = cart.items.find(item => 
            inventory[item.id as keyof typeof inventory] < item.quantity
          );
          return outOfStock ? `${outOfStock.name} is out of stock` : null;
        },
        
        // Minimum order validation
        minimumOrder: (cart) => {
          return cart.subtotal < 10 ? 'Minimum order amount is $10' : null;
        },
        
        // Maximum items validation
        maxItems: (cart) => {
          const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
          return totalItems > 50 ? 'Maximum 50 items per order' : null;
        },
        
        // Coupon validation
        validCoupon: (cart) => {
          if (!cart.couponCode) return null;
          const validCoupons = ['SAVE10', 'WELCOME20', 'STUDENT15'];
          return validCoupons.includes(cart.couponCode) ? null : 'Invalid coupon code';
        }
      },
      
      // Layer 3: Prep Function for UI State Management
      prep: (cart) => {
        // First run schema validation
        const schemaResult = ShoppingCartSchema.safeParse(cart);
        if (!schemaResult.success) {
          throw new Error(`Schema validation failed: ${schemaResult.error.message}`);
        }
        
        // Calculate totals
        const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
        
        // Apply discount
        let discount = 0;
        if (cart.couponCode === 'SAVE10') discount = subtotal * 0.1;
        else if (cart.couponCode === 'WELCOME20') discount = subtotal * 0.2;
        else if (cart.couponCode === 'STUDENT15') discount = subtotal * 0.15;
        
        const total = subtotal + tax + shipping - discount;
        
        // Update calculated values
        const updatedCart = {
          ...cart,
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          shipping: Math.round(shipping * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          total: Math.round(total * 100) / 100
        };
        
        return updatedCart;
      }
    });
  }

  addItem(id: string, name: string, price: number, category: 'electronics' | 'clothing' | 'books' | 'home') {
    // Check if item already exists
    const existingItem = this.value.items.find(item => item.id === id);
    
    if (existingItem) {
      // Increase quantity
      this.next({
        ...this.value,
        items: this.value.items.map(item =>
          item.id === id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      // Add new item
      const newItem = {
        id,
        name,
        price,
        quantity: 1,
        category,
        inStock: inventory[id as keyof typeof inventory] > 0
      };
      
      this.next({
        ...this.value,
        items: [...this.value.items, newItem]
      });
    }
  }

  removeItem(id: string) {
    this.next({
      ...this.value,
      items: this.value.items.filter(item => item.id !== id)
    });
  }

  updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(id);
      return;
    }
    
    this.next({
      ...this.value,
      items: this.value.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    });
  }

  applyCoupon(couponCode: string) {
    this.next({
      ...this.value,
      couponCode
    });
  }

  clearCart() {
    this.next({
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      couponCode: undefined,
      isProcessing: false,
      errors: []
    });
  }
}

// Usage Example
const cart = new ShoppingCartForest();

// Add items
cart.addItem('laptop-1', 'Gaming Laptop', 999.99, 'electronics');
cart.addItem('book-1', 'TypeScript Handbook', 29.99, 'books');

// Try to add out-of-stock item (will pass schema but fail business rules)
cart.addItem('shirt-1', 'Cotton T-Shirt', 19.99, 'clothing');

// Apply coupon
cart.applyCoupon('SAVE10');

// Check validation results
const validation = cart.validate(cart.value);
console.log('Is valid:', validation.isValid);
console.log('Errors:', validation.errors);

export { ShoppingCartForest, ShoppingCartSchema, type CartState };
