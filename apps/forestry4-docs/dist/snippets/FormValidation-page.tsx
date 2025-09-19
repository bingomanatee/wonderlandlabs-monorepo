// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/FormValidation.tsx
// Description: Form validation example page
// Last synced: Thu Sep 18 21:57:37 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

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
import SnippetBlock from '../../components/SnippetBlock';

// Types for the form validation examples
interface FormState {
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
}



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
          <SnippetBlock
            snippetName="UserRegistrationSchema"
            language="typescript"
            title="Form Schema with Complex Rules"
          />


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
