import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { Forest } from './Forest';

interface UserProfile {
  name: string;
  email: string;
  age: number;
}

interface AppState {
  user: UserProfile;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

class UserProfileBranch extends Forest<UserProfile> {
  updateName(name: string) {
    this.mutate((draft) => {
      draft.name = name;
    });
  }

  updateEmail(email: string) {
    this.mutate((draft) => {
      draft.email = email;
    });
  }

  incrementAge() {
    this.mutate((draft) => {
      draft.age += 1;
    });
  }

  getDisplayName(): string {
    return `${this.value.name} (${this.value.age})`;
  }
}

class AppForest extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: { name: 'John', email: 'john@example.com', age: 30 },
        settings: { theme: 'light', notifications: true },
      },
      name: 'app',
    });
  }

  getUserBranch(): UserProfileBranch {
    return this.$branch<UserProfile, UserProfileBranch>(['user'], {
      subclass: UserProfileBranch,
      schema: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        age: z.number().min(0),
      }),
    });
  }

  toggleTheme() {
    this.mutate((draft) => {
      draft.settings.theme =
        draft.settings.theme === 'light' ? 'dark' : 'light';
    });
  }

  toggleNotifications() {
    this.mutate((draft) => {
      draft.settings.notifications = !draft.settings.notifications;
    });
  }
}

describe('Forest Refactored', () => {
  describe('Basic Forest functionality', () => {
    it('should create a forest with initial value', () => {
      const forest = new Forest({
        value: { count: 0, name: 'test' },
        name: 'simple',
      });

      expect(forest.value.count).toBe(0);
      expect(forest.value.name).toBe('test');
      expect(forest.$name).toBe('simple');
      expect(forest.$isRoot).toBe(true);
    });

    it('should update forest value', () => {
      const forest = new Forest({
        value: { count: 0 },
      });

      forest.next({ count: 5 });
      expect(forest.value.count).toBe(5);
    });

    it('should support mutation', () => {
      const forest = new Forest({
        value: { items: ['a', 'b'], total: 2 },
      });

      forest.mutate((draft) => {
        draft.items.push('c');
        draft.total = draft.items.length;
      });

      expect(forest.value.items).toEqual(['a', 'b', 'c']);
      expect(forest.value.total).toBe(3);
    });
  });

  describe('Branch creation', () => {
    it('should create basic branches', () => {
      const forest = new Forest({
        value: {
          user: { name: 'John', age: 30 },
          settings: { theme: 'light' },
        },
      });

      const userBranch = forest.$branch(['user'], {});

      expect(userBranch.value.name).toBe('John');
      expect(userBranch.value.age).toBe(30);
      expect(userBranch.$parent).toBe(forest);
      expect(userBranch.$path).toEqual(['user']);
    });

    it('should create branches with custom subclasses', () => {
      const app = new AppForest();
      const userBranch = app.getUserBranch();

      expect(userBranch).toBeInstanceOf(UserProfileBranch);
      expect(userBranch.value.name).toBe('John');
      expect(userBranch.getDisplayName()).toBe('John (30)');
    });

    it('should allow branch methods to update parent', () => {
      const app = new AppForest();
      const userBranch = app.getUserBranch();

      userBranch.updateName('Jane');
      userBranch.incrementAge();

      expect(app.value.user.name).toBe('Jane');
      expect(app.value.user.age).toBe(31);
      expect(userBranch.getDisplayName()).toBe('Jane (31)');
    });
  });

  describe('Custom Forest subclasses', () => {
    it('should support custom forest methods', () => {
      const app = new AppForest();

      expect(app.value.settings.theme).toBe('light');

      app.toggleTheme();
      expect(app.value.settings.theme).toBe('dark');

      app.toggleTheme();
      expect(app.value.settings.theme).toBe('light');
    });

    it('should support notifications toggle', () => {
      const app = new AppForest();

      expect(app.value.settings.notifications).toBe(true);

      app.toggleNotifications();
      expect(app.value.settings.notifications).toBe(false);
    });
  });

  describe('Reactivity', () => {
    it('should notify subscribers of changes', () => {
      const forest = new Forest({ value: { count: 0 } });
      const listener = vi.fn();

      forest.subscribe(listener);
      expect(listener).toHaveBeenCalledWith({ count: 0 });

      forest.next({ count: 1 });
      expect(listener).toHaveBeenCalledWith({ count: 1 });
    });

    it('should notify branch subscribers when parent changes', () => {
      const forest = new Forest({
        value: { user: { name: 'John' }, other: 'data' },
      });

      const userBranch = forest.$branch(['user'], {});
      const listener = vi.fn();

      userBranch.subscribe(listener);
      expect(listener).toHaveBeenCalledWith({ name: 'John' });

      forest.mutate((draft) => {
        draft.user.name = 'Jane';
      });

      expect(listener).toHaveBeenCalledWith({ name: 'Jane' });
    });

    it('should notify parent subscribers when branch changes', () => {
      const forest = new Forest({
        value: { user: { name: 'John' }, count: 0 },
      });

      const userBranch = forest.$branch(['user'], {});
      const parentListener = vi.fn();

      forest.subscribe(parentListener);
      parentListener.mockClear(); // Clear initial call

      userBranch.next({ name: 'Jane' });

      expect(parentListener).toHaveBeenCalledWith({
        user: { name: 'Jane' },
        count: 0,
      });
    });
  });

  describe('Validation', () => {
    it('should validate branch data with schema', () => {
      const app = new AppForest();
      const userBranch = app.getUserBranch();

      // Valid update
      expect(() => userBranch.updateEmail('jane@example.com')).not.toThrow();
      expect(userBranch.value.email).toBe('jane@example.com');

      // Invalid email should throw
      expect(() => userBranch.updateEmail('invalid-email')).toThrow();
    });
  });
});
