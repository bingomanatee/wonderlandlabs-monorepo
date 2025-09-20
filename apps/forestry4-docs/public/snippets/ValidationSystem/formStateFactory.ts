import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';
import { createFieldValueSchema, type FieldValue } from './FieldBranch';

// Zod schema for form state validation
const FormStateSchema = z.object({
  username: createFieldValueSchema(z.string()),
  email: createFieldValueSchema(z.string()),
  age: createFieldValueSchema(z.number()),
  isSubmitting: z.boolean(),
  canSubmit: z.boolean(),
  submitError: z.string(),
});

export type FormState = z.infer<typeof FormStateSchema>;

/**
 * Modern Forestry 4.1.3 subclass for advanced form state management
 */
export class FormStateForest extends Forest<FormState> {
  constructor() {
    super({
      name: 'advanced-form',
      schema: FormStateSchema,
      value: {
        username: { value: '', isDirty: false, error: null, title: 'Username', type: 'text' },
        email: { value: '', isDirty: false, error: null, title: 'Email', type: 'email' },
        age: { value: 0, isDirty: false, error: null, title: 'Age', type: 'number' },
        isSubmitting: false,
        canSubmit: false,
        submitError: 'Please fill out all fields',
      },
      prep: this.prepFunction.bind(this),
    });
  }

  // Form submission control
  setSubmitting(isSubmitting: boolean) {
    this.set('isSubmitting', isSubmitting);
  }

  // Field update actions
  updateUsername(newValue: string) {
    this.mutate(draft => {
      draft.username.value = newValue;
      draft.username.isDirty = true;
    });
  }

  updateEmail(newValue: string) {
    this.mutate(draft => {
      draft.email.value = newValue;
      draft.email.isDirty = true;
    });
  }

  updateAge(newValue: number) {
    this.mutate(draft => {
      draft.age.value = newValue;
      draft.age.isDirty = true;
    });
  }

  // Generic form change handler
  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value: fieldValue, type } = event.target;
    const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
    
    this.mutate(draft => {
      if (name === 'username' && typeof processedValue === 'string') {
        draft.username.value = processedValue;
        draft.username.isDirty = true;
      } else if (name === 'email' && typeof processedValue === 'string') {
        draft.email.value = processedValue;
        draft.email.isDirty = true;
      } else if (name === 'age' && typeof processedValue === 'number') {
        draft.age.value = processedValue;
        draft.age.isDirty = true;
      }
    });
  }

  // Reset form to initial state
  reset() {
    this.next({
      username: { value: '', isDirty: false, error: null, title: 'Username', type: 'text' },
      email: { value: '', isDirty: false, error: null, title: 'Email', type: 'email' },
      age: { value: 0, isDirty: false, error: null, title: 'Age', type: 'number' },
      isSubmitting: false,
      canSubmit: false,
      submitError: 'Please fill out all fields',
    });
  }

  // Computed properties
  get isFormValid(): boolean {
    return this.value.username.error === null && 
           this.value.email.error === null && 
           this.value.age.error === null;
  }

  get isFormFilled(): boolean {
    return this.value.username.value.length > 0 && 
           this.value.email.value.length > 0 && 
           this.value.age.value > 0;
  }

  get hasErrors(): boolean {
    return this.value.username.error !== null || 
           this.value.email.error !== null || 
           this.value.age.error !== null;
  }

  get isDirty(): boolean {
    return this.value.username.isDirty || 
           this.value.email.isDirty || 
           this.value.age.isDirty;
  }

  get formData() {
    return {
      username: this.value.username.value,
      email: this.value.email.value,
      age: this.value.age.value,
    };
  }

  // Validation helper
  validateField(fieldName: keyof Pick<FormState, 'username' | 'email' | 'age'>): string | null {
    const field = this.value[fieldName];
    return field.error;
  }

  // Prep function for form-level calculations
  private prepFunction(input: Partial<FormState>, current: FormState): FormState {
    const result = { ...current, ...input };

    // Calculate form submission eligibility
    const allFieldsValid = result.username.error === null && 
                          result.email.error === null && 
                          result.age.error === null;
    
    const allFieldsFilled = result.username.value.length > 0 && 
                           result.email.value.length > 0 && 
                           result.age.value > 0;

    result.canSubmit = allFieldsValid && allFieldsFilled && !result.isSubmitting;

    // Set appropriate submit error message
    if (!result.canSubmit && !result.isSubmitting) {
      if (!allFieldsFilled) {
        result.submitError = 'Please fill out all fields';
      } else if (!allFieldsValid) {
        result.submitError = 'Please fix validation errors before submitting';
      } else {
        result.submitError = '';
      }
    } else {
      result.submitError = '';
    }

    return result;
  }
}

// Factory function for backward compatibility with useForestryLocal
export default function formStateFactory(): FormStateForest {
  return new FormStateForest();
}
