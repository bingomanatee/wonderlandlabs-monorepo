import { describe, it, expect } from 'vitest';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

interface UserProfile {
  name: string;
  email: string;
  age: number;
  avatar?: string;
}

class UserProfileBranch extends Forest<UserProfile> {
  get displayName(): string {
    return `${this.value.name} (${this.value.age})`;
  }

  get isAdult(): boolean {
    return this.value.age >= 18;
  }

  updateName(name: string) {
    this.mutate(draft => {
      draft.name = name;
    });
  }

  updateEmail(email: string) {
    this.mutate(draft => {
      draft.email = email;
    });
  }

  celebrateBirthday() {
    this.mutate(draft => {
      draft.age += 1;
    });
  }

  setAvatar(avatarUrl: string) {
    this.mutate(draft => {
      draft.avatar = avatarUrl;
    });
  }
}

interface AppState {
  user: {
    profile: UserProfile;
    preferences: { theme: 'light' | 'dark' };
  };
}

class AppStore extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: {
          profile: { name: 'John', email: 'john@example.com', age: 25 },
          preferences: { theme: 'light' }
        }
      }
    });
  }

  getUserProfile(): UserProfileBranch {
    return this.$branch<UserProfile, UserProfileBranch>(['user', 'profile'], {
      subclass: UserProfileBranch,
      schema: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        age: z.number().min(0).max(150, 'Age must be realistic'),
        avatar: z.string().url().optional()
      })
    });
  }
}

describe('Branch Subclassing', () => {
  it('should create branch with custom subclass', () => {
    const app = new AppStore();
    const profileBranch = app.getUserProfile();

    expect(profileBranch).toBeInstanceOf(UserProfileBranch);
    expect(profileBranch.displayName).toBe('John (25)');
    expect(profileBranch.isAdult).toBe(true);
  });

  it('should use custom methods', () => {
    const app = new AppStore();
    const profileBranch = app.getUserProfile();

    profileBranch.updateName('Jane Doe');
    expect(profileBranch.value.name).toBe('Jane Doe');
    expect(profileBranch.displayName).toBe('Jane Doe (25)');

    profileBranch.celebrateBirthday();
    expect(profileBranch.value.age).toBe(26);
    expect(profileBranch.displayName).toBe('Jane Doe (26)');
  });

  it('should validate with schema', () => {
    const app = new AppStore();
    const profileBranch = app.getUserProfile();

    expect(() => {
      profileBranch.updateEmail('invalid-email');
    }).toThrow();

    expect(() => {
      profileBranch.mutate(draft => {
        draft.age = -5;
      });
    }).toThrow();
  });

  it('should sync custom branch with parent', () => {
    const app = new AppStore();
    const profileBranch = app.getUserProfile();

    profileBranch.updateName('Alice');
    profileBranch.celebrateBirthday();

    expect(app.value.user.profile.name).toBe('Alice');
    expect(app.value.user.profile.age).toBe(26);
  });
});
