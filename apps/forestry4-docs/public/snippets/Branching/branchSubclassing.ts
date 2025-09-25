// Branch Subclassing - Creating Custom Branch Classes
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

interface UserProfile {
  name: string;
  email: string;
  age: number;
  avatar?: string;
}

// Custom branch class with domain-specific methods
class UserProfileBranch extends Forest<UserProfile> {
  // Computed properties
  get displayName(): string {
    return `${this.value.name} (${this.value.age})`;
  }

  get isAdult(): boolean {
    return this.value.age >= 18;
  }

  // Domain-specific actions
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

  // Factory method for creating typed branches
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

// Usage
const app = new AppStore();
const profileBranch = app.getUserProfile();

// Use custom methods
console.log('Display name:', profileBranch.displayName); // "John (25)"
console.log('Is adult:', profileBranch.isAdult); // true

profileBranch.updateName('Jane Doe');
profileBranch.celebrateBirthday();

console.log('Updated display name:', profileBranch.displayName); // "Jane Doe (26)"
