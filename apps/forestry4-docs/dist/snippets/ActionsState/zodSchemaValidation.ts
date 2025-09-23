// Auto-generated snippet from: apps/forestry4-docs/src/examples/schema-validation/zodSchemaValidation.ts
// Description: Zod schema validation with Forestry stores
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Zod Schema Validation with Forestry
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Define Zod schema
const UserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().min(0, 'Age must be positive').max(150, 'Age must be realistic'),
  email: z.string().email('Invalid email format'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean()
  }).optional()
});

// Create Forest with schema validation
class UserForest extends Forest {
  constructor() {
    super({
      name: '',
      age: 0,
      email: '',
      preferences: {
        theme: 'light' as const,
        notifications: true
      }
    }, {
      name: 'UserStore',
      schema: UserSchema
    });
  }

  updateUser(name: string, age: number, email: string) {
    // This will be validated against the schema
    this.next({ 
      ...this.value,
      name, 
      age, 
      email 
    });
  }

  updatePreferences(theme: 'light' | 'dark', notifications: boolean) {
    this.next({
      ...this.value,
      preferences: { theme, notifications }
    });
  }
}

// Usage
const userStore = new UserForest();

// Valid update - passes schema validation
userStore.updateUser('John Doe', 25, 'john@example.com');

// Invalid update - will throw validation error
try {
  userStore.updateUser('', -5, 'invalid-email'); // Fails validation
} catch (error) {
  console.error('Validation failed:', error.message);
}
