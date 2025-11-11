// Branch Validation - Adding validation to branches
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

interface UserProfile {
  name: string;
  email: string;
  age: number;
  bio?: string;
}

interface AppState {
  user: {
    profile: UserProfile;
    settings: { theme: string };
  };
}

// Branch with Zod schema validation
class ValidatedUserBranch extends Forest<UserProfile> {
  updateProfile(updates: Partial<UserProfile>) {
    this.mutate(draft => {
      Object.assign(draft, updates);
    });
  }

  setBio(bio: string) {
    if (bio.length > 500) {
      throw new Error('Bio too long');
    }
    this.set('bio', bio);
  }
}

class AppStore extends Forest<AppState> {
  constructor() {
    super({
      value: {
        user: {
          profile: { name: 'John', email: 'john@example.com', age: 25 },
          settings: { theme: 'light' }
        }
      }
    });
  }

  getUserProfile(): ValidatedUserBranch {
    return this.$branch<UserProfile, ValidatedUserBranch>(['user', 'profile'], {
      subclass: ValidatedUserBranch,
      schema: z.object({
        name: z.string()
          .min(1, 'Name is required')
          .max(50, 'Name too long'),
        email: z.string()
          .email('Invalid email format')
          .max(100, 'Email too long'),
        age: z.number()
          .int('Age must be a whole number')
          .min(0, 'Age cannot be negative')
          .max(150, 'Age must be realistic'),
        bio: z.string()
          .max(500, 'Bio too long')
          .optional()
      })
    });
  }
}

// Usage with validation
const app = new AppStore();
const userProfile = app.getUserProfile();

try {
  // Valid update
  userProfile.updateProfile({
    name: 'Jane Doe',
    email: 'jane@example.com',
    age: 28
  });
  console.log('Profile updated successfully');
} catch (error) {
  console.error('Validation failed:', error.message);
}

try {
  // Invalid update - will throw validation error
  userProfile.updateProfile({
    name: '', // Empty name - violates min(1)
    email: 'invalid-email', // Invalid email format
    age: -5 // Negative age
  });
} catch (error) {
  console.error('Validation failed:', error.message);
  // Error: Name is required
}

// Custom validation with tests function
const userWithCustomValidation = app.$branch<UserProfile>(['user', 'profile'], {
  tests: (value) => {
    if (value.age < 13 && !value.bio) {
      return 'Users under 13 must have a bio';
    }
    if (value.name.toLowerCase().includes('admin')) {
      return 'Name cannot contain "admin"';
    }
    return null; // Valid
  }
});

try {
  userWithCustomValidation.mutate(draft => {
    draft.age = 12;
    draft.bio = undefined;
  });
} catch (error) {
  console.error('Custom validation failed:', error.message);
  // Error: Users under 13 must have a bio
}
