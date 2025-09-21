// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/__tests__/demoStoreFactory.test.ts
// Description: Complete test suite for demoStoreFactory
// Last synced: Sat Sep 20 21:09:31 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import demoStoreFactory from '../demoStoreFactory';

describe('demoStoreFactory', () => {
  let store: ReturnType<typeof demoStoreFactory>;

  beforeEach(() => {
    store = demoStoreFactory();
  });

  afterEach(() => {
    store.complete();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      expect(store.value.name).toBe('');
      expect(store.value.age).toBe(0);
      expect(store.value.email).toBe('');
      expect(store.value.preferences.theme).toBe('light');
      // Initial state has validation errors for empty fields
      expect(store.value.errors.name).toBe('Name is required');
      expect(store.value.errors.age).toBe(null);
      expect(store.value.errors.email).toBe(null);
    });
  });

  describe('handleInputChange', () => {
    it('should handle text input changes', () => {
      const event = {
        target: { name: 'name', value: 'John Doe', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(event);

      expect(store.value.name).toBe('John Doe');
      expect(store.value.errors.name).toBeNull();
    });

    it('should handle number input changes', () => {
      const event = {
        target: { name: 'age', value: '25', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(event);

      expect(store.value.age).toBe(25);
      expect(store.value.errors.age).toBeNull();
    });

    it('should validate age limits', () => {
      const invalidEvent = {
        target: { name: 'age', value: '200', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(invalidEvent);

      expect(store.value.age).toBe(200);
      expect(store.value.errors.age).toBe('Age cannot exceed 150 years');
    });

    it('should validate negative age', () => {
      const negativeEvent = {
        target: { name: 'age', value: '-5', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(negativeEvent);

      expect(store.value.age).toBe(-5);
      expect(store.value.errors.age).toBe('Age cannot be negative');
    });

    it('should validate minimum age', () => {
      const youngEvent = {
        target: { name: 'age', value: '10', type: 'number' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(youngEvent);

      expect(store.value.age).toBe(10);
      expect(store.value.errors.age).toBe('Must be at least 13 years old');
    });
  });

  describe('validation', () => {
    it('should validate required name', () => {
      const event = {
        target: { name: 'name', value: '', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(event);

      expect(store.value.errors.name).toBe('Name is required');
    });

    it('should validate name length', () => {
      const event = {
        target: { name: 'name', value: 'A', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(event);

      expect(store.value.errors.name).toBe('Name must be at least 2 characters');
    });

    it('should validate email format', () => {
      const event = {
        target: { name: 'email', value: 'invalid-email', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;

      store.$.handleInputChange(event);

      expect(store.value.errors.email).toBe('Please enter a valid email address');
    });

    it('should clear errors for valid input', () => {
      // First set invalid input
      const invalidEvent = {
        target: { name: 'name', value: '', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;
      store.$.handleInputChange(invalidEvent);
      expect(store.value.errors.name).toBe('Name is required');

      // Then set valid input
      const validEvent = {
        target: { name: 'name', value: 'John Doe', type: 'text' }
      } as React.ChangeEvent<HTMLInputElement>;
      store.$.handleInputChange(validEvent);
      expect(store.value.errors.name).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields', () => {
      store.$.updateProfile({ name: 'Jane Smith', age: 30 });

      expect(store.value.name).toBe('Jane Smith');
      expect(store.value.age).toBe(30);
    });
  });

  describe('updatePreferences', () => {
    it('should update theme preference', () => {
      store.$.updatePreferences({ theme: 'dark' });

      expect(store.value.preferences.theme).toBe('dark');
    });
  });

  describe('handleThemeChange', () => {
    it('should handle theme selection change', () => {
      const event = {
        target: { value: 'dark' }
      } as React.ChangeEvent<HTMLSelectElement>;

      store.$.handleThemeChange(event);

      expect(store.value.preferences.theme).toBe('dark');
    });
  });

  describe('setupUser', () => {
    it('should setup user with profile and preferences', () => {
      store.$.setupUser({
        profile: { name: 'Test User', email: 'test@example.com' },
        preferences: { theme: 'dark' }
      });

      expect(store.value.name).toBe('Test User');
      expect(store.value.email).toBe('test@example.com');
      expect(store.value.preferences.theme).toBe('dark');
    });
  });

  describe('setAge', () => {
    it('should set valid age', () => {
      store.$.setAge(25);

      expect(store.value.age).toBe(25);
    });

    it('should throw error for invalid age', () => {
      expect(() => store.$.setAge(-5)).toThrow('Age must be between 0 and 150');
      expect(() => store.$.setAge(200)).toThrow('Age must be between 0 and 150');
    });
  });

  describe('validateAndSave', () => {
    it('should return success message for valid profile', () => {
      store.$.updateProfile({
        name: 'Valid User',
        age: 25,
        email: 'valid@example.com'
      });

      const result = store.$.validateAndSave();

      expect(result).toBe('Profile saved successfully!');
    });

    it('should throw error for invalid profile', () => {
      store.$.updateProfile({
        name: '',
        age: 10,
        email: 'invalid-email'
      });

      expect(() => store.$.validateAndSave()).toThrow('Validation failed');
    });
  });
});
