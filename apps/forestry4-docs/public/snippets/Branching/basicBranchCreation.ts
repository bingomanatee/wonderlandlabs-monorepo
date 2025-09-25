// Basic Branch Creation Example
import { Forest } from '@wonderlandlabs/forestry4';

interface AppState {
  user: {
    profile: { name: string; email: string; age: number };
    preferences: { theme: 'light' | 'dark'; notifications: boolean };
  };
  cart: {
    items: Array<{ id: string; name: string; price: number; quantity: number }>;
    total: number;
  };
}

class AppStore extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: {
          profile: { name: 'John Doe', email: 'john@example.com', age: 30 },
          preferences: { theme: 'light', notifications: true }
        },
        cart: { items: [], total: 0 }
      },
      name: 'app'
    });
  }
}

const app = new AppStore();

// Create a basic branch for user profile
const profileBranch = app.$branch(['user', 'profile'], {});

console.log('Profile branch value:', profileBranch.value);
// Output: { name: 'John Doe', email: 'john@example.com', age: 30 }

console.log('Branch parent:', profileBranch.$parent === app); // true
console.log('Branch path:', profileBranch.$path); // ['user', 'profile']

// Update through branch - automatically syncs with parent
profileBranch.mutate(draft => {
  draft.name = 'Jane Smith';
  draft.age = 28;
});

console.log('Parent user after branch update:', app.value.user.profile);
// Output: { name: 'Jane Smith', email: 'john@example.com', age: 28 }
