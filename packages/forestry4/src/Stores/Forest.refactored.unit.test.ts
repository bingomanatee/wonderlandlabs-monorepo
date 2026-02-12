import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { Forest } from './Forest';
import type { StoreParams } from '../types';

const basicBranchStateSchema = z.object({
  user: z.object({
    name: z.string(),
    age: z.number(),
  }),
  settings: z.object({
    theme: z.literal('light'),
  }),
});
type BasicBranchState = z.infer<typeof basicBranchStateSchema>;

const userProfileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0),
});
type UserProfile = z.infer<typeof userProfileSchema>;

const appStateSchema = z.object({
  user: userProfileSchema,
  settings: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
  }),
});
type AppState = z.infer<typeof appStateSchema>;

class UserProfileBranch extends Forest<UserProfile> {
  constructor(params: StoreParams<UserProfile>) {
    super({
      ...params,
      schema: params.schema ?? userProfileSchema,
    });
  }

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

const windowSchema = z.object({
  title: z.string(),
});
type WindowValue = z.infer<typeof windowSchema>;

class WindowBranch extends Forest<WindowValue> {
  upperTitle() {
    return this.value.title.toUpperCase();
  }
}

const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});
type PointValue = z.infer<typeof pointSchema>;

const rectSchema = z.object({
  topLeft: pointSchema,
  widthHeight: pointSchema,
});
type RectValue = z.infer<typeof rectSchema>;

class PointBranch extends Forest<PointValue> {
  toTuple() {
    return [this.value.x, this.value.y];
  }

  moveBy(dx: number, dy: number) {
    this.mutate((draft) => {
      draft.x += dx;
      draft.y += dy;
    });
  }
}

class RectStore extends Forest<RectValue> {
  constructor() {
    super({
      value: rectSchema.parse({
        topLeft: { x: 10, y: 20 },
        widthHeight: { x: 100, y: 50 },
      }),
      branchParams: new Map([['*', { subclass: PointBranch }]]),
    });
  }

  rectPoint(which: 'topLeft' | 'widthHeight') {
    return this.$br.$get(which) as PointBranch;
  }
}

class AppForest extends Forest<AppState> {
  constructor() {
    super({
      value: appStateSchema.parse({
        user: { name: 'John', email: 'john@example.com', age: 30 },
        settings: { theme: 'light', notifications: true },
      }),
      name: 'app',
      branchParams: new Map([['user', { subclass: UserProfileBranch }]]),
    });
  }

  getUserBranch(): UserProfileBranch {
    return this.$br.$get('user') as UserProfileBranch;
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
        value: basicBranchStateSchema.parse({
          user: { name: 'John', age: 30 },
          settings: { theme: 'light' },
        }),
      });

      const userBranch = forest.$br.$add<BasicBranchState['user']>(
        ['user'],
        {},
      );

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

    it('should warn that $branch is deprecated', () => {
      const forest = new Forest({
        value: { user: { name: 'John' } },
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      forest.$branch(['user'], {});

      expect(warnSpy).toHaveBeenCalledWith(
        '$branch is deprecated; use this.$branches.$add',
      );
      warnSpy.mockRestore();
    });

    it('should keep branch references and return them from $br.get', () => {
      const forest = new Forest({
        value: { user: { name: 'John' } },
      });

      const userBranch = forest.$br.$add(['user'], {});
      const foundBranch = forest.$br.get('user');

      expect(foundBranch).toBe(userBranch);
    });

    it('should throw when creating a duplicate branch for the same path', () => {
      const forest = new Forest({
        value: { user: { name: 'John' } },
      });

      forest.$br.$add(['user'], {});
      expect(() => forest.$br.$add(['user'], {})).toThrow(
        'Branch already exists at user',
      );
    });

    it('should complete and eject a branch when its value becomes undefined', () => {
      const forest = new Forest({
        value: { user: { name: 'John' } },
      });

      const userBranch = forest.$br.$add(['user'], {});
      const completeSpy = vi.spyOn(userBranch, 'complete');

      forest.next({} as { user: { name: string } });

      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect(forest.$br.get('user')).toBeUndefined();
    });

    it('should throw when creating a branch on undefined data', () => {
      const forest = new Forest({
        value: {} as { user?: { name: string } },
      });

      expect(() => forest.$br.$add(['user'], {})).toThrow(
        'Cannot create branch at user; value is undefined',
      );
      expect(forest.$br.get('user')).toBeUndefined();
    });

    it('should support $br.delete for manual ejection', () => {
      const forest = new Forest({
        value: { user: { name: 'John' } },
      });

      const userBranch = forest.$br.$add(['user'], {});
      const completeSpy = vi.spyOn(userBranch, 'complete');

      expect(forest.$br.delete(['user'])).toBe(true);
      expect(completeSpy).toHaveBeenCalledTimes(1);
      expect(forest.$br.get('user')).toBeUndefined();
      expect(forest.$br.delete(['user'])).toBe(false);

      expect(() => forest.$br.$add(['user'], {})).not.toThrow();
    });

    it('should normalize path keys in $branches map operations', () => {
      const forest = new Forest({
        value: {
          windows: {
            'window-id': { title: 'Main' },
          },
        },
      });

      const branch = forest.$branches.$add(['windows', 'window-id'], {});

      expect(forest.$branches.get('windows.window-id')).toBe(branch);
      expect(forest.$branches.$get(['windows', 'window-id'])).toBe(branch);
      expect(forest.$branches.has(['windows', 'window-id'])).toBe(true);
      expect(forest.$branches.delete(['windows', 'window-id'])).toBe(true);
      expect(branch.isActive).toBe(false);
    });

    it('should expose $br as shorthand for $branches', () => {
      const forest = new Forest({
        value: {
          windows: {
            'window-id': { title: 'Main' },
          },
        },
      });
      const branch = forest.$br.$add(['windows', 'window-id'], {});

      expect(forest.$br).toBe(forest.$branches);
      expect(forest.$br.$get(['windows', 'window-id'])).toBe(branch);
    });

    it('should prevent overriding existing values via $branches.set', () => {
      const forest = new Forest({
        value: {
          one: { id: 1 },
          two: { id: 2 },
        },
      });

      const branchOne = forest.$branches.$add(['one'], {});
      const branchTwo = forest.$branches.$add(['two'], {});

      expect(() => forest.$branches.set(['one'], branchTwo)).toThrow(
        'Branch already exists at one',
      );
      expect(forest.$branches.get('one')).toBe(branchOne);
    });

    it('should lazy-create branch in $br.$get using branchParams path definitions', () => {
      const forest = new Forest({
        value: {
          windows: {
            'window-id': { title: 'Main' },
          },
        },
        branchParams: new Map([
          ['windows.window-id', { subclass: WindowBranch }],
        ]),
      });

      const branch = forest.$br.$get(['windows', 'window-id']);

      expect(branch).toBeInstanceOf(WindowBranch);
      expect((branch as WindowBranch).upperTitle()).toBe('MAIN');
      expect(forest.$br.get('windows.window-id')).toBe(branch);
    });

    it('should inject wildcard branch class for adds without subclass', () => {
      const forest = new Forest({
        value: {
          panel: { title: 'Overview' },
        },
        branchParams: new Map([['*', { subclass: WindowBranch }]]),
      });

      const branch = forest.$br.$add(['panel'], {});

      expect(branch).toBeInstanceOf(WindowBranch);
      expect((branch as WindowBranch).upperTitle()).toBe('OVERVIEW');
    });

    it('should always derive branch value from parent even if value is forced in params', () => {
      const forest = new Forest({
        value: {
          panel: { title: 'Overview' },
        },
      });

      const branch = forest.$br.$add(['panel'], {
        value: { title: 'Injected' },
      } as any);

      expect((branch as Forest<{ title: string }>).value.title).toBe(
        'Overview',
      );
    });

    it('should warn when branch class is provided but missing', () => {
      const forest = new Forest({
        value: {
          panel: { title: 'Overview' },
        },
        branchParams: new Map([['panel', { subclass: undefined }]]),
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const branch = forest.$br.$add(['panel'], {});

      expect(branch).toBeInstanceOf(Forest);
      expect(warnSpy).toHaveBeenCalledWith(
        'Branch class provided for "panel" in branchParams["panel"] but does not exist',
      );
      warnSpy.mockRestore();
    });

    it('should apply schema and prep from branchParams defaults', () => {
      const panelSchema = z.object({
        title: z.string().min(5),
      });

      const forest = new Forest({
        value: {
          panel: { title: 'Overview' },
        },
        branchParams: new Map([
          [
            'panel',
            {
              schema: panelSchema,
              prep: (
                input: Partial<{ title: string }>,
                current: { title: string },
              ) => ({
                ...current,
                ...input,
                title: (input.title ?? current.title).trim(),
              }),
            },
          ],
        ]),
      });

      const panel = forest.$br.$get<{ title: string }>('panel');
      expect(panel).toBeDefined();

      expect(() => panel!.next({ title: 'no' })).toThrow();

      panel!.next({ title: '  Updated Title  ' });
      expect(forest.value.panel.title).toBe('Updated Title');
    });

    it('should let a rect method lazy-create Point branches for topLeft and widthHeight', () => {
      const rect = new RectStore();

      expect(rect.$br.get('topLeft')).toBeUndefined();
      expect(rect.$br.get('widthHeight')).toBeUndefined();

      const topLeft = rect.rectPoint('topLeft');
      expect(topLeft).toBeInstanceOf(PointBranch);
      expect(topLeft.toTuple()).toEqual([10, 20]);
      expect(rect.$br.get('topLeft')).toBe(topLeft);

      const widthHeight = rect.rectPoint('widthHeight');
      expect(widthHeight).toBeInstanceOf(PointBranch);
      expect(widthHeight.toTuple()).toEqual([100, 50]);
      expect(rect.$br.get('widthHeight')).toBe(widthHeight);

      widthHeight.moveBy(5, 10);
      expect(rect.value.widthHeight).toEqual({ x: 105, y: 60 });
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

      const userBranch = forest.$br.$add(['user'], {});
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

      const userBranch = forest.$br.$add(['user'], {});
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
