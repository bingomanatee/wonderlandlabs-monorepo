import { FormField } from '@/types.ts';

type ErrorHandler = (error: Error | string, title?: string) => void;

export function emailBranchConfig(handleError?: ErrorHandler) {
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
          handleError(error as Error, 'Email Validation Error');
        }
      },

      safeSetValueFromEvent: function(value: FormField<string>, event: React.ChangeEvent<HTMLInputElement>) {
        try {
          this.$.setValueFromEvent(event);
        } catch (error) {
          handleError(error as Error, 'Email Validation Error');
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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (result.value.length > 100) {
        isValid = false
        errorString = 'Email too long (max 100 characters)'
      } else if (!emailRegex.test(result.value)) {
        isValid = false
        errorString = 'Invalid email format'
      } else {
        const domain = result.value.split('@')[1]?.toLowerCase()

        // Check for disposable email domains
        const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com']
        if (domain && disposableDomains.includes(domain)) {
          isValid = false
          errorString = 'Disposable email addresses are not allowed'
        }

        // Check for restricted domains
        const restrictedDomains = ['competitor.com', 'blocked-company.com']
        if (domain && restrictedDomains.includes(domain)) {
          isValid = false
          errorString = 'Email domain is not allowed for registration'
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
        fieldType: 'email'
      }
    }],

    // Email domain analysis
    ['domainAnalysis', function(field: FormField<string>) {
      const domain = field.value.split('@')[1]?.toLowerCase() || ''
      return {
        domain,
        isGmail: domain === 'gmail.com',
        isOutlook: domain.includes('outlook') || domain.includes('hotmail'),
        isCorporate: !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain),
        isDisposable: ['10minutemail.com', 'tempmail.org'].includes(domain)
      }
    }],

    // Email format quality
    ['formatQuality', function(field: FormField<string>) {
      return {
        hasAtSymbol: field.value.includes('@'),
        hasDomain: field.value.split('@').length === 2,
        hasValidFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value),
        length: field.value.length
      }
    }]
  ]),

  tests: [
    // Tests should only catch truly impossible states that indicate system bugs
    // User input validation belongs in prep
  ]
  };
}
