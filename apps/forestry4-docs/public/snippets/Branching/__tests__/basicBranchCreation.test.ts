import { describe, it, expect } from 'vitest';
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

describe('Basic Branch Creation', () => {
  it('should create a branch with correct initial value', () => {
    const app = new AppStore();
    const profileBranch = app.$branch(['user', 'profile'], {});

    expect(profileBranch.value).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
  });

  it('should maintain parent-child relationship', () => {
    const app = new AppStore();
    const profileBranch = app.$branch(['user', 'profile'], {});

    expect(profileBranch.$parent).toBe(app);
    expect(profileBranch.$path).toEqual(['user', 'profile']);
    expect(profileBranch.$isRoot).toBe(false);
    expect(app.$isRoot).toBe(true);
  });

  it('should synchronize updates from branch to parent', () => {
    const app = new AppStore();
    const profileBranch = app.$branch(['user', 'profile'], {});

    profileBranch.mutate(draft => {
      draft.name = 'Jane Smith';
      draft.age = 28;
    });

    expect(app.value.user.profile.name).toBe('Jane Smith');
    expect(app.value.user.profile.age).toBe(28);
    expect(app.value.user.profile.email).toBe('john@example.com');
  });

  it('should synchronize updates from parent to branch', () => {
    const app = new AppStore();
    const profileBranch = app.$branch(['user', 'profile'], {});

    app.mutate(draft => {
      draft.user.profile.name = 'Bob Johnson';
      draft.user.profile.age = 35;
    });

    expect(profileBranch.value.name).toBe('Bob Johnson');
    expect(profileBranch.value.age).toBe(35);
    expect(profileBranch.value.email).toBe('john@example.com');
  });
});
