import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import { type FieldValue, StringFieldValueSchema } from './FieldBranch.ts';
import { z } from 'zod';

// Email-specific validators
const emailValidators = [
  (value: string) => (value.length > 100 ? 'Email too long (max 100 characters)' : null),
  (value: string) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : null),
  (value: string) => {
    const domain = value.split('@')[1]?.toLowerCase();
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
    ];
    return domain && disposableDomains.includes(domain)
      ? 'Disposable email addresses are not allowed'
      : null;
  },
  (value: string) => {
    const domain = value.split('@')[1]?.toLowerCase();
    const restrictedDomains = ['competitor.com', 'blocked-company.com'];
    return domain && restrictedDomains.includes(domain)
      ? 'Email domain is not allowed for registration'
      : null;
  },
];

/**
 * Email-specific branch that extends Forest directly
 * This will be connected to the parent FormStateForest at the 'email' path
 */
export class EmailBranch extends Forest<FieldValue<string>> {
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

        // Run email-specific validation when dirty
        let error: string | null = null;
        if (result.isDirty) {
          for (const validator of emailValidators) {
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

  // Email-specific methods
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
  get domain(): string | null {
    const email = this.value.value;
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
  }

  get isValidFormat(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value.value);
  }

  get isDisposable(): boolean {
    const domain = this.domain;
    if (!domain) return false;
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
    ];
    return disposableDomains.includes(domain);
  }

  get isRestricted(): boolean {
    const domain = this.domain;
    if (!domain) return false;
    const restrictedDomains = ['competitor.com', 'blocked-company.com'];
    return restrictedDomains.includes(domain);
  }
}

// Branch configuration for use with $branch
export function emailBranchConfig() {
  return {
    subclass: EmailBranch,
    schema: StringFieldValueSchema,
  };
}
