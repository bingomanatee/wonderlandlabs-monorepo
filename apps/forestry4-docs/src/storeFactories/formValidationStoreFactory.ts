import { Forest } from '@wonderlandlabs/forestry';
import { z } from 'zod';
import UserRegistrationSchema from '../examples/form-validation/UserRegistrationSchema';

// Form state interface
export interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  age: number;
  agreeToTerms: boolean;
  newsletter?: boolean;
  interests?: string[];
  errors?: Record<string, string>;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
  submitMessage?: string;
  submitError?: string;
}

// Initial form state
const initialFormState: FormState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  age: 0,
  agreeToTerms: false,
  newsletter: false,
  interests: [],
  errors: {},
  isSubmitting: false,
  isSubmitted: false,
  submitMessage: '',
  submitError: ''
};

// Mock server function
const submitRegistration = async (formData: FormState) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, userId: Math.random().toString(36) };
};

// Form validation store factory
const formValidationStoreFactory = () => new Forest<FormState>({
  name: 'registration-form',
  value: initialFormState,
  schema: UserRegistrationSchema,
  
  actions: {
    // Field-specific validation
    validateField: async function(value: FormState, fieldName: keyof FormState) {
      try {
        // Validate single field using schema
        const fieldSchema = UserRegistrationSchema.shape[fieldName];
        if (fieldSchema) {
          fieldSchema.parse(value[fieldName]);
        }
        
        // Clear error if validation passes
        this.$.clearFieldError(fieldName);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldError = error.errors.find(e => 
            e.path.includes(fieldName)
          );
          if (fieldError) {
            this.$.setFieldError(fieldName, fieldError.message);
          }
        }
      }
    },
    
    // Update field with validation
    updateField: function(value: FormState, fieldName: keyof FormState, fieldValue: any) {
      this.set(fieldName, fieldValue);
      
      // Trigger validation for this field and dependent fields
      this.$.validateField(fieldName);
      
      // Handle cross-field dependencies
      if (fieldName === 'password') {
        this.$.validateField('confirmPassword');
      }
      if (fieldName === 'newsletter') {
        this.$.validateField('interests');
      }
    },
    
    // Set field error
    setFieldError: function(value: FormState, fieldName: string, error: string) {
      this.mutate(draft => {
        if (!draft.errors) draft.errors = {};
        draft.errors[fieldName] = error;
      });
    },
    
    // Clear field error
    clearFieldError: function(value: FormState, fieldName: string) {
      this.mutate(draft => {
        if (draft.errors) {
          delete draft.errors[fieldName];
        }
      });
    },
    
    // Form submission with full validation
    submitForm: async function(value: FormState) {
      this.set('isSubmitting', true);
      
      try {
        // Run full validation
        const validation = await this.validate(value);
        if (!validation.isValid) {
          throw new Error(`Form validation failed: ${validation.error}`);
        }
        
        // Submit to server
        const result = await submitRegistration(value);
        
        this.set('isSubmitted', true);
        this.set('submitMessage', 'Registration successful!');
        
        return result;
      } catch (error) {
        this.set('submitError', error.message);
        throw error;
      } finally {
        this.set('isSubmitting', false);
      }
    },
    
    // Check if form is valid
    isFormValid: function(value: FormState): boolean {
      const hasErrors = value.errors && Object.keys(value.errors).length > 0;
      const hasRequiredFields = value.username && value.email && 
                               value.password && value.firstName && 
                               value.lastName && value.agreeToTerms;
      return !hasErrors && !!hasRequiredFields;
    }
  }
});

export default formValidationStoreFactory;
