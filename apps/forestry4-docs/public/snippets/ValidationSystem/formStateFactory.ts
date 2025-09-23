// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/ValidationSystem/form/formState.ts
// Description: Form state factory with branch coordination and validation
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import React from 'react';
import { NumberFieldValueSchema, StringFieldValueSchema } from './FieldBranch.ts';
import type { FeedbackFn } from '@/hooks/useToast.ts';

// Zod schema for the form state
export const FormStateSchema = z.object({
  username: StringFieldValueSchema,
  email: StringFieldValueSchema,
  age: NumberFieldValueSchema,
  isSubmitting: z.boolean(),
  canSubmit: z.boolean(),
  submitError: z.string(),
});

// Type inference from the schema
export type FormState = z.infer<typeof FormStateSchema>;

const INITIAL: FormState = {
  username: { value: '', isDirty: false, error: null, title: 'Username', type: 'text' },
  email: { value: '', isDirty: false, error: null, title: 'Email', type: 'email' },
  age: { value: 0, isDirty: false, error: null, title: 'Age', type: 'number' },
  isSubmitting: false,
  canSubmit: false,
  submitError: '',
};

/**
 * Modern Forestry 4.1.3 subclass for advanced form state management
 */
export class FormStateForest extends Forest<FormState> {
  constructor(handleError: FeedbackFn, handleSuccess: FeedbackFn) {
    super({
      name: 'advanced-form',
      schema: FormStateSchema,
      value: INITIAL,
      res: new Map([
        ['handleError', handleError],
        ['handleSuccess', handleSuccess],
      ]),
      prep: (input: Partial<FormState>, current: FormState): FormState => {
        const result = { ...current, ...input };

        // Compute form-level validation state
        const hasUsernameError = !!result.username.error;
        const hasEmailError = !!result.email.error;
        const hasAgeError = !!result.age.error;
        const hasAnyError = hasUsernameError || hasEmailError || hasAgeError;

        // Check if all fields are filled
        const isUsernameFilled = result.username.value.length > 0;
        const isEmailFilled = result.email.value.length > 0;
        const isAgeFilled = result.age.value > 0;
        const isFormFilled = isUsernameFilled && isEmailFilled && isAgeFilled;

        // Compute canSubmit and submitError
        if (!isFormFilled) {
          result.canSubmit = false;
          result.submitError = 'Please fill out all fields';
        } else if (hasAnyError) {
          result.canSubmit = false;
          result.submitError = 'Please fix validation errors before submitting';
        } else {
          result.canSubmit = true;
          result.submitError = '';
        }

        return result;
      },
      tests: [
        // Critical business rule - Username/email combination uniqueness
        (value: FormState) => {
          // In real app, this would check database for existing user
          const testConflict =
            value.username.value === 'admin' && value.email.value.includes('admin');
          return testConflict ? 'Username and email combination already exists' : null;
        },
      ],
    });
  }

  // Form submission control
  setSubmitting(isSubmitting: boolean) {
    this.set('isSubmitting', !!isSubmitting);
  }

  // Generic form change handler
  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue, type } = event.target;
    const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;

    this.set([name, 'value'], processedValue);
  }

  // Reset form
  reset() {
    this.next(INITIAL);
  }

  // Computed properties for better API
  get isFormValid(): boolean {
    return !this.value.username.error && !this.value.email.error && !this.value.age.error;
  }

  get canSubmit() {
    return this.value.canSubmit && !this.value.isSubmitting;
  }

  get isFormFilled(): boolean {
    return (
      this.value.username.value.length > 0 &&
      this.value.email.value.length > 0 &&
      this.value.age.value > 0
    );
  }

  submit() {
    if (!this.canSubmit) {
      return this.$res.get('handleError')?.('you cannot submit data', 'Submission Blocked');
    }
    this.set('isSubmitting', true);
    this.$res.get('handleSuccess')?.('Your data has been submitted', 'Sim Submit');
    const self = this;
    setTimeout(() => {
      self.reset();
    }, 2000);
  }

  get hasErrors(): boolean {
    return !this.isFormValid;
  }

  get isDirty(): boolean {
    return this.value.username.isDirty || this.value.email.isDirty || this.value.age.isDirty;
  }
}

// Factory function for useForestryLocal compatibility
export default function formStateFactory(handleError: FeedbackFn, handleSuccess: FeedbackFn) {
  return new FormStateForest(handleError, handleSuccess);
}
