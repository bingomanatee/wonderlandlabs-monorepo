import { Forest } from '../Stores/Forest';
import { z } from 'zod';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface ShoppingCart {
  items: CartItem[];
  total: number;
}

export interface AppState {
  cart: ShoppingCart;
  user: {
    id: string;
    name: string;
  };
}

/**
 * Custom Forest branch for shopping cart functionality
 */
export class ShoppingCartBranch extends Forest<ShoppingCart> {
  addItem(productId: string, quantity: number, price: number) {
    this.mutate(draft => {
      const existingItem = draft.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        draft.items.push({ productId, quantity, price });
      }
      this.updateTotal(draft);
    });
  }

  removeItem(productId: string) {
    this.mutate(draft => {
      draft.items = draft.items.filter(item => item.productId !== productId);
      this.updateTotal(draft);
    });
  }

  updateQuantity(productId: string, quantity: number) {
    this.mutate(draft => {
      const item = draft.items.find(item => item.productId === productId);
      if (item) {
        if (quantity <= 0) {
          draft.items = draft.items.filter(item => item.productId !== productId);
        } else {
          item.quantity = quantity;
        }
        this.updateTotal(draft);
      }
    });
  }

  clearCart() {
    this.next({ items: [], total: 0 });
  }

  getItemCount(): number {
    return this.value.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  hasItem(productId: string): boolean {
    return this.value.items.some(item => item.productId === productId);
  }

  private updateTotal(draft: ShoppingCart) {
    draft.total = draft.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  }
}

/**
 * Main application Forest with shopping cart functionality
 */
export class ShoppingAppForest extends Forest<AppState> {
  constructor() {
    super({
      value: {
        cart: { items: [], total: 0 },
        user: { id: '', name: '' }
      },
      name: 'shopping-app'
    });
  }

  getCartBranch(): ShoppingCartBranch {
    return this.$branch<ShoppingCart, ShoppingCartBranch>(['cart'], {
      subclass: ShoppingCartBranch,
      schema: z.object({
        items: z.array(z.object({
          productId: z.string(),
          quantity: z.number().positive(),
          price: z.number().positive()
        })),
        total: z.number().min(0)
      })
    });
  }

  setUser(id: string, name: string) {
    this.mutate(draft => {
      draft.user.id = id;
      draft.user.name = name;
    });
  }

  clearUser() {
    this.mutate(draft => {
      draft.user = { id: '', name: '' };
    });
  }
}
