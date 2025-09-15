import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Badge,
  Box,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import AdvancedFormDemo from '../../components/ValidationSystem/AdvancedFormDemo';
import CodeBlock from '../../components/CodeBlock';

const FormValidation: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Advanced Form Validation
            <Badge ml={3} colorScheme="blue">
              Form Patterns
            </Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            A comprehensive form validation example demonstrating field-level validation,
            cross-field dependencies, async validation, and error handling patterns.
          </Text>
        </Box>

        {/* Key Features */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Key Features Demonstrated
          </Heading>
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Field-Level Validation:</strong> Individual field validation with specific
              error messages
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Cross-Field Dependencies:</strong> Password confirmation, conditional required
              fields
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Async Validation:</strong> Username availability, email verification
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Dynamic Validation Rules:</strong> Rules that change based on other field
              values
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Error State Management:</strong> Field-specific error display and clearing
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Form Submission Flow:</strong> Validation before submission with loading
              states
            </ListItem>
          </List>
        </Box>

        {/* Live Demo */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Live Demo
          </Heading>
          <Text mb={4} color="gray.600">
            Try filling out the form below. Notice how validation provides immediate feedback,
            handles async operations, and manages complex field dependencies.
          </Text>
          <AdvancedFormDemo />
        </Box>

        {/* Validation Architecture */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Validation Architecture
          </Heading>

          <Alert status="info" mb={4}>
            <AlertIcon />
            This example demonstrates a multi-layered validation approach with field-level,
            form-level, and async validation patterns.
          </Alert>

          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>
                Field-Level Validation
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Each field has its own validation rules that run immediately on change, providing
                instant feedback to users.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Cross-Field Dependencies
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Some fields depend on others (password confirmation, conditional requirements) and
                are validated whenever dependent fields change.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Async Validation
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Username and email fields perform server-side validation to check availability and
                validity, with proper loading states and error handling.
              </Text>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>
                Form-Level Validation
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Overall form validation ensures all fields are valid before allowing submission,
                with comprehensive error reporting.
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Schema & Validation Rules */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Validation Schema
          </Heading>
          <CodeBlock language="typescript" title="Form Schema with Complex Rules">
            {`import { z } from 'zod';

const UserRegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
    
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
    
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
    
  age: z.number()
    .int('Age must be a whole number')
    .min(13, 'Must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
    
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions'),
    
  newsletter: z.boolean().optional(),
  
  // Conditional field - required if newsletter is true
  interests: z.array(z.string()).optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
).refine(
  (data) => !data.newsletter || (data.interests && data.interests.length > 0),
  {
    message: "Please select at least one interest for newsletter",
    path: ["interests"],
  }
);

// Custom async validation tests
const formTests = [
  // Async username availability check
  async (form: FormState) => {
    if (form.username && form.username.length >= 3) {
      const isAvailable = await checkUsernameAvailability(form.username);
      if (!isAvailable) {
        return 'Username is already taken';
      }
    }
    return null;
  },
  
  // Async email verification
  async (form: FormState) => {
    if (form.email && form.email.includes('@')) {
      const isValid = await verifyEmailDomain(form.email);
      if (!isValid) {
        return 'Email domain is not supported';
      }
    }
    return null;
  },
  
  // Business logic validation
  (form: FormState) => {
    if (form.age && form.age < 18 && form.newsletter) {
      return 'Users under 18 cannot subscribe to newsletter';
    }
    return null;
  }
];`}
          </CodeBlock>
        </Box>

        {/* Store Implementation */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Store Implementation
          </Heading>
          <CodeBlock language="typescript" title="Form Store with Advanced Validation">
            {`const createFormStore = () => new Forest<FormState>({
  name: 'registration-form',
  value: initialFormState,
  schema: UserRegistrationSchema,
  tests: formTests,
  
  actions: {
    // Field-specific validation
    validateField: async function(value: FormState, fieldName: keyof FormState) {
      try {
        // Validate single field using schema
        const fieldSchema = UserRegistrationSchema.shape[fieldName];
        if (fieldSchema) {
          fieldSchema.parse(value[fieldName]);
        }
        
        // Run relevant async tests
        const relevantTests = formTests.filter(test => 
          test.toString().includes(fieldName)
        );
        
        for (const test of relevantTests) {
          const error = await test(value);
          if (error) {
            this.$.setFieldError(fieldName, error);
            return;
          }
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
          throw new Error(\`Form validation failed: \${validation.error}\`);
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
});`}
          </CodeBlock>
        </Box>

        {/* Best Practices */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Form Validation Best Practices
          </Heading>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Immediate Feedback:</strong> Validate fields as users type for better UX
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Progressive Enhancement:</strong> Start with basic validation, add async
              checks
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Clear Error Messages:</strong> Provide specific, actionable error information
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Loading States:</strong> Show progress during async validation and submission
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Accessibility:</strong> Proper ARIA labels and error associations
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Error Recovery:</strong> Allow users to easily correct and retry
            </ListItem>
          </List>
        </Box>
      </VStack>
    </Container>
  );
};

export default FormValidation;
