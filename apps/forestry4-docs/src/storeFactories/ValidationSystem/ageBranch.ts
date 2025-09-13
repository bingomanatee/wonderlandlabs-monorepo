import { FormField } from '@/types.ts';

type ErrorHandler = (error: Error | string, title?: string) => void;

export function ageBranchConfig(handleError?: ErrorHandler) {
  return {
  value: { value: 0, isValid: true, errorString: '', isDirty: false },

  actions: {
    setValue: function(value: FormField<number>, newValue: number) {
      this.next({ ...value, value: newValue })
    },

    // Event-centric action that extracts and parses value from number input events
    setValueFromEvent: function(value: FormField<number>, valueString: string) {
      const numValue = parseInt(valueString) || 0
      this.$.setValue(numValue)
    },

    // Safe actions that catch validation errors and show toasts
    ...(handleError ? {
      safeSetValue: function(value: FormField<number>, newValue: number) {
        try {
          this.$.setValue(newValue);
        } catch (error) {
          handleError(error as Error, 'Age Validation Error');
        }
      },

      safeSetValueFromEvent: function(value: FormField<number>, valueString: string) {
        try {
          this.$.setValueFromEvent(valueString);
        } catch (error) {
          handleError(error as Error, 'Age Validation Error');
        }
      }
    } : {})
  },
  prep: function(input: Partial<FormField<number>>, current: FormField<number>): FormField<number> {
    const result = { ...current, ...input }

    // Set initial value if it doesn't exist, then check if dirty
    if (!this.res.has('initialValue')) {
      this.res.set('initialValue', result.value)
    }

    const initialValue = this.res.get('initialValue')
    const isDirty = result.isDirty || result.value !== initialValue

    // Once dirty, stop checking - just validate
    if (isDirty) {
      result.isDirty = true
    }

    // ALL user validation feedback (only show errors when dirty)
    let isValid = true
    let errorString = ''

    if (isDirty) {
      if (!Number.isFinite(result.value)) {
        isValid = false
        errorString = 'Please enter a valid number'
      } else if (result.value < 0) {
        isValid = false
        errorString = 'Age cannot be negative'
      } else if (!Number.isInteger(result.value)) {
        isValid = false
        errorString = 'Age must be a whole number'
      } else if (result.value < 13) {
        isValid = false
        errorString = 'Users under 13 cannot create accounts due to COPPA regulations'
      } else if (result.value > 120) {
        isValid = false
        errorString = 'Age must be realistic (max 120)'
      }
    }

    return {
      ...result,
      isValid,
      errorString,
      isDirty
    }
  },

  res: new Map([
    // Reactive validation state for external consumption
    ['validationStatus', function(field: FormField<number>) {
      return {
        isValid: field.isValid,
        errorMessage: field.errorString,
        hasError: !field.isValid,
        fieldType: 'age'
      }
    }],

    // Business rule compliance status
    ['coppaCompliant', function(field: FormField<number>) {
      return field.value >= 13
    }],

    // Data quality indicators
    ['dataQuality', function(field: FormField<number>) {
      return {
        isComplete: field.value > 0,
        isRealistic: field.value <= 120,
        isLegal: field.value >= 13
      }
    }]
  ]),

  tests: [
    // Tests should only catch truly impossible states that indicate system bugs
    // User input validation (including negative numbers) belongs in prep
  ]
  };
}
