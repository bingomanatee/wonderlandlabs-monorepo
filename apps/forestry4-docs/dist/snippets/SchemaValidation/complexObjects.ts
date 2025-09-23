// Auto-generated snippet from: apps/forestry4-docs/src/examples/schema-validation/complexObjects.ts
// Description: Complex nested object schemas with validation
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Complex Object Schemas with Nested Validation
import { z } from 'zod';
import { Forest } from '@wonderlandlabs/forestry';

// Address schema
const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid zip code format'),
  country: z.string().default('US')
});

// Contact info schema
const ContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  website: z.string().url().optional()
});

// Preferences schema
const PreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  language: z.enum(['en', 'es', 'fr', 'de']).default('en'),
  notifications: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
    sms: z.boolean().default(false)
  }),
  privacy: z.object({
    profileVisible: z.boolean().default(true),
    showEmail: z.boolean().default(false),
    allowMessages: z.boolean().default(true)
  })
});

// Main user schema with nested objects
const ComplexUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  contact: ContactSchema,
  address: AddressSchema.optional(),
  preferences: PreferencesSchema,
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    version: z.number().int().positive().default(1)
  })
});

class ComplexUserForest extends Forest {
  constructor() {
    super({
      id: '',
      name: '',
      contact: {
        email: '',
        phone: undefined,
        website: undefined
      },
      address: undefined,
      preferences: {
        theme: 'light' as const,
        language: 'en' as const,
        notifications: {
          email: true,
          push: false,
          sms: false
        },
        privacy: {
          profileVisible: true,
          showEmail: false,
          allowMessages: true
        }
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    }, {
      name: 'ComplexUserStore',
      schema: ComplexUserSchema
    });
  }

  updateContact(email: string, phone?: string, website?: string) {
    this.next({
      ...this.value,
      contact: { email, phone, website },
      metadata: {
        ...this.value.metadata,
        updatedAt: new Date(),
        version: this.value.metadata.version + 1
      }
    });
  }

  updateAddress(address: z.infer<typeof AddressSchema>) {
    this.next({
      ...this.value,
      address,
      metadata: {
        ...this.value.metadata,
        updatedAt: new Date(),
        version: this.value.metadata.version + 1
      }
    });
  }

  updateNotificationPreferences(notifications: Partial<typeof this.value.preferences.notifications>) {
    this.next({
      ...this.value,
      preferences: {
        ...this.value.preferences,
        notifications: {
          ...this.value.preferences.notifications,
          ...notifications
        }
      },
      metadata: {
        ...this.value.metadata,
        updatedAt: new Date(),
        version: this.value.metadata.version + 1
      }
    });
  }
}

// Usage
const userStore = new ComplexUserForest();

// Update nested contact info
userStore.updateContact('user@example.com', '+1-555-0123', 'https://example.com');

// Update nested address
userStore.updateAddress({
  street: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  zipCode: '12345',
  country: 'US'
});

// Update nested preferences
userStore.updateNotificationPreferences({
  email: false,
  push: true
});
