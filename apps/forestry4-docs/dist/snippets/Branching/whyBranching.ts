// Why Use Branches? - Solving Real-World Problems

// ❌ WITHOUT BRANCHES - Monolithic approach
import { Forest } from '@wonderlandlabs/forestry4';

interface AppState {
  user: { name: string; email: string; avatar: string };
  cart: { items: any[]; total: number; discount: number };
  ui: { theme: string; sidebarOpen: boolean; notifications: any[] };
}

// Monolithic store - everything mixed together
class MonolithicStore extends Forest<AppState> {
  // User methods mixed with cart methods mixed with UI methods
  updateUserName(name: string) { /* ... */ }
  updateUserEmail(email: string) { /* ... */ }
  addCartItem(item: any) { /* ... */ }
  removeCartItem(id: string) { /* ... */ }
  calculateCartTotal() { /* ... */ }
  toggleSidebar() { /* ... */ }
  setTheme(theme: string) { /* ... */ }
  addNotification(notification: any) { /* ... */ }
  
  // Hard to test individual features
  // Hard to reuse components
  // Violates single responsibility principle
}

// ✅ WITH BRANCHES - Focused, modular approach

// Focused branch classes with single responsibilities
class UserProfileBranch extends Forest<AppState['user']> {
  get displayName() {
    return this.value.name || 'Anonymous';
  }

  updateProfile(updates: Partial<AppState['user']>) {
    this.mutate(draft => Object.assign(draft, updates));
  }

  validateEmail() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.email);
  }
}

class ShoppingCartBranch extends Forest<AppState['cart']> {
  get itemCount() {
    return this.value.items.length;
  }

  get finalTotal() {
    return Math.max(0, this.value.total - this.value.discount);
  }

  addItem(item: any) {
    this.mutate(draft => {
      draft.items.push(item);
      draft.total += item.price;
    });
  }

  removeItem(id: string) {
    this.mutate(draft => {
      const index = draft.items.findIndex(item => item.id === id);
      if (index >= 0) {
        const item = draft.items[index];
        draft.total -= item.price;
        draft.items.splice(index, 1);
      }
    });
  }

  applyDiscount(amount: number) {
    this.mutate(draft => {
      draft.discount = amount;
    });
  }
}

class UIStateBranch extends Forest<AppState['ui']> {
  toggleSidebar() {
    this.mutate(draft => {
      draft.sidebarOpen = !draft.sidebarOpen;
    });
  }

  setTheme(theme: 'light' | 'dark') {
    this.mutate(draft => {
      draft.theme = theme;
    });
  }

  addNotification(message: string, type: 'info' | 'error' | 'success' = 'info') {
    this.mutate(draft => {
      draft.notifications.push({
        id: Date.now(),
        message,
        type,
        timestamp: new Date()
      });
    });
  }
}

// Main store becomes a factory for focused branches
class ModularAppStore extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: { name: '', email: '', avatar: '' },
        cart: { items: [], total: 0, discount: 0 },
        ui: { theme: 'light', sidebarOpen: false, notifications: [] }
      }
    });
  }

  // Factory methods for focused branches
  getUserProfile(): UserProfileBranch {
    return this.$branch(['user'], { subclass: UserProfileBranch });
  }

  getShoppingCart(): ShoppingCartBranch {
    return this.$branch(['cart'], { subclass: ShoppingCartBranch });
  }

  getUIState(): UIStateBranch {
    return this.$branch(['ui'], { subclass: UIStateBranch });
  }
}

// Benefits in action:
const app = new ModularAppStore();

// 1. FOCUSED TESTING - Test each feature in isolation
const userProfile = app.getUserProfile();
const cart = app.getShoppingCart();
const ui = app.getUIState();

// 2. REUSABLE COMPONENTS - Each branch can be used independently
// UserProfileComponent only needs UserProfileBranch
// ShoppingCartComponent only needs ShoppingCartBranch

// 3. CLEAR SEPARATION OF CONCERNS
userProfile.updateProfile({ name: 'John', email: 'john@example.com' });
cart.addItem({ id: '1', name: 'Widget', price: 10 });
ui.setTheme('dark');

// 4. EASIER DEBUGGING - Changes are scoped to specific domains
console.log('User valid email:', userProfile.validateEmail());
console.log('Cart total:', cart.finalTotal);
console.log('UI theme:', ui.value.theme);

// 5. BETTER TYPESCRIPT SUPPORT - Each branch has its own type
// userProfile.value is typed as AppState['user']
// cart.value is typed as AppState['cart']
// ui.value is typed as AppState['ui']
