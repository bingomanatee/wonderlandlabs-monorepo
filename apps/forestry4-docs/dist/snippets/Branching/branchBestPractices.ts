// Branch Best Practices and Patterns
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// ✅ DO: Create focused, single-responsibility branches
class UserProfileBranch extends Forest<UserProfile> {
  // Only user profile related methods
  updateName(name: string) { this.set('name', name); }
  updateEmail(email: string) { this.set('email', email); }
  get displayName() { return `${this.value.name} <${this.value.email}>`; }
}

// ✅ DO: Use factory methods for branch creation
class AppStore extends Forest<AppState> {
  // Clear, typed factory methods
  getUserProfile(): UserProfileBranch {
    return this.$branch(['user', 'profile'], {
      subclass: UserProfileBranch,
      schema: userProfileSchema
    });
  }

  getShoppingCart(): ShoppingCartBranch {
    return this.$branch(['cart'], {
      subclass: ShoppingCartBranch,
      schema: cartSchema
    });
  }
}

// ✅ DO: Use consistent naming conventions
interface AppState {
  user: {
    profile: UserProfile;    // Noun for data
    preferences: UserPrefs;  // Noun for data
  };
  cart: ShoppingCart;        // Noun for data
  ui: UIState;              // Noun for data
}

// ✅ DO: Validate at branch boundaries
const userProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

// ✅ DO: Keep branch hierarchies shallow (2-3 levels max)
const profileBranch = app.$branch(['user', 'profile'], {});
const settingsBranch = app.$branch(['user', 'preferences'], {});

// ❌ DON'T: Create overly deep hierarchies
// const deepBranch = app.$branch(['user', 'profile', 'address', 'street', 'number'], {});

// ✅ DO: Use branches for logical domain separation
class OrderManagementBranch extends Forest<Order[]> {
  addOrder(order: Order) {
    this.mutate(draft => {
      draft.push(order);
    });
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    this.mutate(draft => {
      const order = draft.find(o => o.id === orderId);
      if (order) order.status = status;
    });
  }

  getOrdersByStatus(status: OrderStatus) {
    return this.value.filter(order => order.status === status);
  }
}

// ✅ DO: Use branches for feature isolation
class FeatureFlagsBranch extends Forest<FeatureFlags> {
  isEnabled(feature: string): boolean {
    return this.value[feature] === true;
  }

  enableFeature(feature: string) {
    this.set(feature, true);
  }

  disableFeature(feature: string) {
    this.set(feature, false);
  }
}

// ✅ DO: Create reusable branch patterns
function createListBranch<T>(items: T[]) {
  return class ListBranch extends Forest<T[]> {
    add(item: T) {
      this.mutate(draft => {
        draft.push(item);
      });
    }

    remove(index: number) {
      this.mutate(draft => {
        draft.splice(index, 1);
      });
    }

    update(index: number, item: T) {
      this.mutate(draft => {
        draft[index] = item;
      });
    }

    get count() {
      return this.value.length;
    }

    clear() {
      this.next([]);
    }
  };
}

// Usage of reusable pattern
const TodoListBranch = createListBranch<Todo>();
const NotificationsBranch = createListBranch<Notification>();

// ✅ DO: Use branches for testing isolation
describe('UserProfileBranch', () => {
  let profileBranch: UserProfileBranch;

  beforeEach(() => {
    const app = new AppStore();
    profileBranch = app.getUserProfile();
  });

  it('should update name correctly', () => {
    profileBranch.updateName('Jane Doe');
    expect(profileBranch.value.name).toBe('Jane Doe');
  });

  it('should validate email format', () => {
    expect(() => {
      profileBranch.updateEmail('invalid-email');
    }).toThrow('Invalid email format');
  });
});

// ✅ DO: Use branches for component isolation in React
const UserProfileComponent = () => {
  const userProfile = useAppStore().getUserProfile();
  const profileData = useObserveForest(userProfile);
  
  return (
    <div>
      <input 
        value={profileData.name}
        onChange={e => userProfile.updateName(e.target.value)}
      />
    </div>
  );
};

// ❌ DON'T: Mix unrelated concerns in a single branch
class BadMixedBranch extends Forest<any> {
  // DON'T mix user profile with cart logic
  updateUserName(name: string) { /* ... */ }
  addCartItem(item: any) { /* ... */ }
  setUITheme(theme: string) { /* ... */ }
}

// ❌ DON'T: Create branches for every single property
// const nameBranch = app.$branch(['user', 'profile', 'name'], {});
// const emailBranch = app.$branch(['user', 'profile', 'email'], {});
// Instead, create one branch for the logical unit (profile)

// ✅ DO: Use branches for cross-cutting concerns
class AuditLogBranch extends Forest<AuditEntry[]> {
  logAction(action: string, userId: string, data?: any) {
    this.mutate(draft => {
      draft.push({
        id: crypto.randomUUID(),
        action,
        userId,
        data,
        timestamp: new Date()
      });
    });
  }

  getRecentActions(limit = 10) {
    return this.value
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}
