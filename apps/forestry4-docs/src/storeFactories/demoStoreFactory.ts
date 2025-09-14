import { Forest } from '@wonderlandlabs/forestry4';

interface UserProfile {
  name: string;
  age: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
  };
}

export default function demoForestFactory() {
  return new Forest<UserProfile>({
    name: 'user-profile-demo',
    value: { 
      name: '', 
      age: 0, 
      email: '', 
      preferences: { theme: 'light' } 
    },
    actions: {
      // Nested action example
      updateProfile: function(value, updates: Partial<UserProfile>) {
        this.mutate(draft => {
          Object.assign(draft, updates);
        });
      },
      updatePreferences: function(value, prefs: Partial<UserProfile['preferences']>) {
        this.mutate(draft => {
          Object.assign(draft.preferences, prefs);
        });
      },
      // Nested action that calls other actions
      setupUser: function(value, userData: { profile: Partial<UserProfile>, preferences: Partial<UserProfile['preferences']> }) {
        // This demonstrates nested actions
        this.$.updateProfile(userData.profile);
        this.$.updatePreferences(userData.preferences);
      },
      // Action with validation
      setAge: function(value, age: number) {
        if (age < 0 || age > 150) {
          throw new Error('Age must be between 0 and 150');
        }
        this.mutate(draft => {
          draft.age = age;
        });
      },
      // Action with complex logic
      validateAndSave: function(value) {
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
      }
    ]
  });
}

export type { UserProfile };
