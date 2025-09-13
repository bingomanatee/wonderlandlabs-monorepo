import { FormField } from '@/types.ts';

type ErrorHandler = (error: Error | string, title?: string) => void;

export function usernameBranchConfig(handleError?: ErrorHandler) {
  return {
  value: { value: '', isValid: true, errorString: '', dirty: false },

  actions: {
    setValue: function(value: FormField<string>, newValue: string) {
      this.next({ ...value, value: newValue, dirty: true })
    },

    // Event-centric action that extracts value from input events
    setValueFromEvent: function(value: FormField<string>, event: React.ChangeEvent<HTMLInputElement>) {
      this.$.setValue(event.target.value)
    },

    // Safe actions that catch validation errors and show toasts
    ...(handleError ? {
      safeSetValue: function(value: FormField<string>, newValue: string) {
        try {
          this.$.setValue(newValue);
        } catch (error) {
          handleError(error as Error, 'Username Validation Error');
        }
      },

      safeSetValueFromEvent: function(value: FormField<string>, event: React.ChangeEvent<HTMLInputElement>) {
        try {
          this.$.setValueFromEvent(event);
        } catch (error) {
          handleError(error as Error, 'Username Validation Error');
        }
      }
    } : {})
  },
  prep: function(input: Partial<FormField<string>>, current: FormField<string>): FormField<string> {
    const result = { ...current, ...input }

    // ALL user validation feedback (real-time, only show errors when dirty)
    let isValid = true
    let errorString = ''

    if (result.dirty && result.value.length > 0) {
      if (result.value.length < 3) {
        isValid = false
        errorString = 'Username too short (min 3 characters)'
      } else if (result.value.length > 20) {
        isValid = false
        errorString = 'Username too long (max 20 characters)'
      } else if (result.value.includes(' ')) {
        isValid = false
        errorString = 'Username cannot contain spaces'
      } else {
        // Check for reserved usernames
        const reservedUsernames = ['admin', 'root', 'system', 'api', 'null', 'undefined']
        if (reservedUsernames.includes(result.value.toLowerCase())) {
          isValid = false
          errorString = 'Username is reserved and cannot be used'
        }

        // Check for inappropriate content
        const inappropriateWords = ['spam', 'test123', 'delete', 'hack']
        if (inappropriateWords.some(word => result.value.toLowerCase().includes(word))) {
          isValid = false
          errorString = 'Username contains inappropriate content'
        }
      }
    }

    return {
      ...result,
      isValid,
      errorString
    }
  },

  res: new Map([
    // Reactive validation state for external consumption
    ['validationStatus', function(field: FormField<string>) {
      return {
        isValid: field.isValid,
        errorMessage: field.errorString,
        hasError: !field.isValid,
        fieldType: 'username'
      }
    }],

    // Username quality metrics
    ['usernameQuality', function(field: FormField<string>) {
      return {
        length: field.value.length,
        hasMinLength: field.value.length >= 3,
        hasMaxLength: field.value.length <= 20,
        isAvailable: !['admin', 'root', 'system'].includes(field.value.toLowerCase())
      }
    }],

    // Character analysis
    ['characterAnalysis', function(field: FormField<string>) {
      return {
        hasLetters: /[a-zA-Z]/.test(field.value),
        hasNumbers: /[0-9]/.test(field.value),
        hasSpecialChars: /[^a-zA-Z0-9]/.test(field.value),
        isAlphanumeric: /^[a-zA-Z0-9]+$/.test(field.value)
      }
    }]
  ]),

  tests: [
    // Tests should only catch truly impossible states that indicate system bugs
    // User input validation belongs in prep
  ]
  };
}
