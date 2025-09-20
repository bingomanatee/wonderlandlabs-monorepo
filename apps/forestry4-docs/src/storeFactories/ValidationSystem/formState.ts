import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import React from 'react';
import { NumberFieldValueSchema, StringFieldValueSchema } from './FieldBranch';

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
  constructor() {
    super({
      name: 'advanced-form',
      schema: FormStateSchema,
      value: INITIAL,
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

  // Field update methods
  updateUsername(newValue: string) {
    this.mutate((draft) => {
      draft.username.value = newValue;
      draft.username.isDirty = true;
    });
  }

  updateEmail(newValue: string) {
    this.mutate((draft) => {
      draft.email.value = newValue;
      draft.email.isDirty = true;
    });
  }

  updateAge(newValue: number) {
    this.mutate((draft) => {
      draft.age.value = newValue;
      draft.age.isDirty = true;
    });
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

  get hasErrors(): boolean {
    return !this.isFormValid;
  }

  get isDirty(): boolean {
    return this.value.username.isDirty || this.value.email.isDirty || this.value.age.isDirty;
  }
}

// Factory function for useForestryLocal compatibility
export default function formStateFactory() {
  return new FormStateForest();
}
