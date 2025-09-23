// Auto-generated snippet from: apps/forestry4-docs/src/examples/schema-validation/basicTypes.ts
// Description: Basic Zod schema types and validation patterns
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Basic Schema Types with Zod
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Basic primitive types
const BasicTypesSchema = z.object({
  // String validations
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  username: z.string().regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  
  // Number validations
  age: z.number().int().min(0).max(150),
  price: z.number().positive('Price must be positive'),
  rating: z.number().min(1).max(5),
  
  // Boolean
  isActive: z.boolean(),
  
  // Date
  createdAt: z.date(),
  
  // Enums
  status: z.enum(['active', 'inactive', 'pending']),
  role: z.enum(['user', 'admin', 'moderator']),
  
  // Optional fields
  bio: z.string().optional(),
  phone: z.string().optional(),
  
  // Nullable fields
  lastLoginAt: z.date().nullable(),
  
  // Default values
  theme: z.enum(['light', 'dark']).default('light'),
  notifications: z.boolean().default(true)
});

class BasicTypesForest extends Forest {
  constructor() {
    super({
      name: '',
      email: '',
      username: '',
      age: 0,
      price: 0,
      rating: 1,
      isActive: false,
      createdAt: new Date(),
      status: 'pending' as const,
      role: 'user' as const,
      bio: undefined,
      phone: undefined,
      lastLoginAt: null,
      theme: 'light' as const,
      notifications: true
    }, {
      name: 'BasicTypesStore',
      schema: BasicTypesSchema
    });
  }

  updateProfile(name: string, email: string, bio?: string) {
    this.next({
      ...this.value,
      name,
      email,
      bio
    });
  }

  setStatus(status: 'active' | 'inactive' | 'pending') {
    this.next({ ...this.value, status });
  }
}

// Usage
const store = new BasicTypesForest();

// Valid updates
store.updateProfile('John Doe', 'john@example.com', 'Software developer');
store.setStatus('active');

// Invalid update - will throw validation error
try {
  store.updateProfile('', 'invalid-email'); // Empty name and invalid email
} catch (error) {
  console.error('Validation failed:', error.message);
}
