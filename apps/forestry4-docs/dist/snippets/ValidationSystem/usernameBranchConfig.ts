// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/ValidationSystem/form/usernameBranch.ts
// Description: Username field branch configuration with validation rules
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import { type FieldValue, StringFieldValueSchema } from './FieldBranch.ts';

// Username-specific validators
const usernameValidators = [
  (value: string) => (value.length < 3 ? 'Username too short (min 3 characters)' : null),
  (value: string) => (value.length > 20 ? 'Username too long (max 20 characters)' : null),
  (value: string) => (value.includes(' ') ? 'Username cannot contain spaces' : null),
  (value: string) => {
    const reservedUsernames = ['admin', 'root', 'system', 'api', 'null', 'undefined'];
    return reservedUsernames.includes(value.toLowerCase())
      ? 'Username is reserved and cannot be used'
      : null;
  },
  (value: string) => {
    const inappropriateWords = ['spam', 'test123', 'delete', 'hack'];
    return inappropriateWords.some((word) => value.toLowerCase().includes(word))
      ? 'Username contains inappropriate content'
      : null;
  },
];

/**
 * Username-specific branch that extends Forest directly
 * This will be connected to the parent FormStateForest at the 'username' path
 */
export class UsernameBranch extends Forest<FieldValue<string>> {
  constructor(params: any) {
    super({
      ...params,
      // The $branch method provides parent, path, name automatically
      // We add field-specific prep function for validation
      prep: (
        input: Partial<FieldValue<string>>,
        current: FieldValue<string>
      ): FieldValue<string> => {
        const result = { ...current, ...input };

        // Set initial value if it doesn't exist - use ORIGINAL value, not updated value
        if (!this.$res.has('initialValue')) {
          this.$res.set('initialValue', current.value);
        }

        const initialValue = this.$res.get('initialValue');
        // Don't override isDirty if it's already set to true
        if (!result.isDirty) {
          result.isDirty = result.value !== initialValue;
        }

        // Run username-specific validation when dirty
        let error: string | null = null;
        if (result.isDirty) {
          for (const validator of usernameValidators) {
            const validationError = validator(result.value);
            if (validationError) {
              error = validationError;
              break;
            }
          }
        }
        result.error = error;

        return result;
      },
    });
  }

  // Username-specific methods
  setFromEvent(event: React.ChangeEvent<HTMLInputElement>) {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    this.setValue(event.target.value);
  }

  setValue(newValue: string) {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    this.mutate((draft: FieldValue<string>) => {
      draft.value = newValue;
      draft.isDirty = true;
    });
  }

  clear() {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    this.setValue('');
  }

  // Computed properties
  get isValidLength(): boolean {
    const length = this.value.value.length;
    return length >= 3 && length <= 20;
  }

  get isAvailable(): boolean {
    // In a real app, this would check against a database
    const reservedUsernames = ['admin', 'root', 'system', 'api', 'null', 'undefined'];
    return !reservedUsernames.includes(this.value.value.toLowerCase());
  }
}

// Branch configuration for use with $branch
export function usernameBranchConfig() {
  return {
    subclass: UsernameBranch,
    schema: StringFieldValueSchema,
  };
}
