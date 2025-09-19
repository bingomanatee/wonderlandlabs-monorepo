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
          <SnippetBlock
            snippetName="formValidationStoreFactory"
            language="typescript"
            title="Form Store with Advanced Validation"
          />
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
