import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import { type FieldValue, NumberFieldValueSchema } from './FieldBranch.ts';

// Age-specific validators
const ageValidators = [
  (value: number) => (!Number.isFinite(value) ? 'Please enter a valid number' : null),
  (value: number) => (value < 0 ? 'Age cannot be negative' : null),
  (value: number) => (!Number.isInteger(value) ? 'Age must be a whole number' : null),
  (value: number) =>
    value < 13 ? 'Users under 13 cannot create accounts due to COPPA regulations' : null,
  (value: number) => (value > 120 ? 'Age must be realistic (max 120)' : null),
];

/**
 * Age-specific branch that extends Forest directly
 * This will be connected to the parent FormStateForest at the 'age' path
 */
export class AgeBranch extends Forest<FieldValue<number>> {
  constructor(params: any) {
    super({
      ...params,
      // The $branch method provides parent, path, name automatically
      // We add field-specific prep function for validation
      prep: (
        input: Partial<FieldValue<number>>,
        current: FieldValue<number>
      ): FieldValue<number> => {
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

        // Run age-specific validation when dirty
        let error: string | null = null;
        if (result.isDirty) {
          for (const validator of ageValidators) {
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

  // Age-specific methods
  setFromEvent(event: React.ChangeEvent<HTMLInputElement>) {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    const numValue = parseInt(event.target.value) || 0;
    this.setValue(numValue);
  }

  setValue(newValue: number) {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    this.mutate((draft: FieldValue<number>) => {
      draft.value = newValue;
      draft.isDirty = true;
    });
  }

  clear() {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    this.setValue(0);
  }

  increment() {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    this.setValue(this.value.value + 1);
  }

  decrement() {
    // Block changes if form is submitting
    if (this.$root?.value?.isSubmitting) {
      return;
    }
    if (this.value.value > 0) {
      this.setValue(this.value.value - 1);
    }
  }

  // Computed properties
  get isMinor(): boolean {
    return this.value.value < 18;
  }

  get isSenior(): boolean {
    return this.value.value >= 65;
  }

  get isValidForRegistration(): boolean {
    return this.value.value >= 13 && this.value.value <= 120;
  }

  get ageGroup(): 'child' | 'teen' | 'adult' | 'senior' | 'invalid' {
    const age = this.value.value;
    if (age < 0 || age > 120) return 'invalid';
    if (age < 13) return 'child';
    if (age < 18) return 'teen';
    if (age < 65) return 'adult';
    return 'senior';
  }
}

// Branch configuration for use with $branch
export function ageBranchConfig() {
  return {
    subclass: AgeBranch,
    schema: NumberFieldValueSchema,
  };
}
