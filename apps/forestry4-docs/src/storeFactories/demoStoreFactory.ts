import { Forest } from '@wonderlandlabs/forestry4';

interface UserProfile {
  name: string;
  age: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
  };
  errors: Record<string, string | null>;
}

// Modern Forestry 4.1.x class extension pattern
class DemoForest extends Forest<UserProfile> {
  constructor() {
    super({
      name: 'user-profile-demo',
      value: {
        name: '',
        age: 0,
        email: '',
        preferences: { theme: 'light' },
        errors: {},
      },
      tests: [
        (value: UserProfile) => {
          if (typeof value.name !== 'string') {
            return 'Name must be a string';
          }
          return null;
        },
        (value: UserProfile) => {
          if (typeof value.age !== 'number') {
            return 'Age must be a number';
          }
          return null;
        },
        (value: UserProfile) => {
          if (typeof value.email !== 'string') {
            return 'Email must be a string';
          }
          return null;
        },
      ],
      prep: (value: UserProfile) => {
        const errors: Record<string, string | null> = {};

        // Validate name
        if (!value.name.trim()) {
          errors.name = 'Name is required';
        } else if (value.name.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          errors.name = null;
        }

        // Validate age
        if (value.age < 0) {
          errors.age = 'Age cannot be negative';
        } else if (value.age > 150) {
          errors.age = 'Age cannot exceed 150 years';
        } else if (value.age > 0 && value.age < 13) {
          errors.age = 'Must be at least 13 years old';
        } else {
          errors.age = null;
        }

        // Validate email
        if (value.email && !value.email.includes('@')) {
          errors.email = 'Please enter a valid email address';
        } else {
          errors.email = null;
        }

        return { ...value, errors };
      },
    });
  }
  // Universal input handler - just handles input conversion
  handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue, type } = event.target;

    if (type === 'number') {
      const numValue = parseInt(fieldValue) || 0;
      this.set(name, numValue);
    } else {
      this.set(name, fieldValue);
    }
  }

  handleThemeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const theme = event.target.value as 'light' | 'dark';
    // Deep set for nested property
    this.set('preferences.theme', theme);
  }

  // Core action methods
  updateProfile(updates: Partial<UserProfile>) {
    this.mutate((draft) => {
      Object.assign(draft, updates);
    });
  }

  updatePreferences(prefs: Partial<UserProfile['preferences']>) {
    this.mutate((draft) => {
      Object.assign(draft.preferences, prefs);
    });
  }
  // Nested action that calls other actions
  setupUser(userData: {
    profile: Partial<UserProfile>;
    preferences: Partial<UserProfile['preferences']>;
  }) {
    // This demonstrates nested actions
    this.$.updateProfile(userData.profile);
    this.$.updatePreferences(userData.preferences);
  }

  // Action with validation
  setAge(age: number) {
    if (age < 0 || age > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    this.set('age', age);
  }

  // Action with complex logic
  validateAndSave() {
    const value = this.value;
    const errors: string[] = [];

    if (!value.name.trim()) {
      errors.push('Name is required');
    }
    if (!value.email.includes('@')) {
      errors.push('Valid email is required');
    }
    if (value.age < 13) {
      errors.push('Must be at least 13 years old');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Simulate save
    console.log('Profile saved successfully:', value);
    return 'Profile saved successfully!';
  }
}

export default function demoForestFactory() {
  return new DemoForest();
}

export type { UserProfile };
