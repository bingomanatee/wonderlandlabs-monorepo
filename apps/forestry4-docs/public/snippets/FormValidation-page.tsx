// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/FormValidation.tsx
// Description: Form validation example page
// Last synced: Sun Sep 21 14:32:35 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  Alert,
  AlertIcon,
  Box,
  Container,
  Heading,
  List,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import AdvancedFormDemo from '../../components/ValidationSystem/AdvancedFormDemo';
import SnippetBlock from '../../components/SnippetBlock';
import Section from '@/components/Section.tsx';
import CodeTabs from '@/components/CodeTabs.tsx';

const FormValidation: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Heading variant="page">Form Validation</Heading>
      <Text fontSize="lg" color="gray.600" maxW="2xl">
        A comprehensive form validation example demonstrating field-level validation, cross-field
        dependencies, async validation, and error handling patterns.
      </Text>

      <VStack layerStyle="section" spacing={8}>
        {/* Live Demo */}
        <Section title="Form Demo" layerStyle="methodCard" w="full">
          <Text mb={4} color="gray.600">
            Try filling out the form below. Notice how validation provides immediate feedback,
            handles async operations, and manages complex field dependencies.
          </Text>
          <AdvancedFormDemo />
        </Section>
        <Section title="source Code">
          <Box>
            <Text color="gray.600" mb={4}>
              Here's how to implement advanced form validation using Forest branches with individual
              field state management:
            </Text>

            <CodeTabs
              tabs={[
                {
                  label: 'Form Component',
                  language: 'tsx',
                  snippet: 'advancedFormComponent',
                  folder: 'ValidationSystem',
                },
                {
                  label: 'Field Branch Component',
                  language: 'tsx',
                  snippet: 'field-branch-component',
                },
                {
                  label: 'Branch Configuration',
                  language: 'typescript',
                  snippet: 'usernameBranchConfig',
                  folder: 'ValidationSystem',
                  ts: true,
                },
                {
                  label: 'Form State Factory',
                  language: 'typescript',
                  snippet: 'formStateFactory',
                  folder: 'ValidationSystem',
                  ts: true,
                },
              ]}
            />
          </Box>
        </Section>
        <Section title="    Features Demonstrated">
          <List spacing={2}>
            <ListItem>
              <strong>Field-Level Validation:</strong> Individual field validation with specific
              error messages
            </ListItem>
            <ListItem>
              <strong>Cross-Field Dependencies:</strong> Password confirmation, conditional required
              fields
            </ListItem>
            <ListItem>
              <strong>Async Validation:</strong> Username availability, email verification
            </ListItem>
            <ListItem>
              <strong>Dynamic Validation Rules:</strong> Rules that change based on other field
              values
            </ListItem>
            <ListItem>
              <strong>Error State Management:</strong> Field-specific error display and clearing
            </ListItem>
            <ListItem>
              <strong>Form Submission Flow:</strong> Validation before submission with loading
              states
            </ListItem>
          </List>
        </Section>
        <Section title="Branched Stores">
          <Heading size="lg">Advanced Form - Using Forest with Branches</Heading>
          <Text color="gray.600">
            This example showcases Forestry 4's branch system. Only <strong>Forests</strong> can
            create branches - each form field is managed by its own branch with independent
            validation, while the parent forest coordinates overall form state.
          </Text>

          <Box p={4} bg="blue.50" borderRadius="md">
            <Text fontWeight="semibold" mb={2}>
              🌿 Branch Benefits:
            </Text>
            <VStack spacing={1} align="start" fontSize="sm">
              <Text>
                • <strong>Independent validation</strong> - Each field has its own validation logic
              </Text>
              <Text>
                • <strong>Focused actions</strong> - Field-specific actions like setValue()
              </Text>
              <Text>
                • <strong>Isolated state</strong> - Changes to one field don't affect others
              </Text>
              <Text>
                • <strong>Coordinated updates</strong> - Parent store sees all field changes
              </Text>
              <Text>
                • <strong>Modular design</strong> - Easy to add/remove fields without affecting
                others
              </Text>
            </VStack>
          </Box>

          <Alert status="info">
            <AlertIcon />
            <Text fontSize="sm">
              <strong>Key Points:</strong> Only <code>Forest</code> instances can create branches.
              Form submission state (<code>canSubmit</code>, <code>submitError</code>) is calculated
              in prep functions as data state, not validation errors. This allows the UI to show why
              submission is disabled without throwing exceptions.
            </Text>
          </Alert>
        </Section>
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
          <UnorderedList>
            <ListItem>
              <strong>Immediate Feedback:</strong> Validate fields as users type for better UX
            </ListItem>
            <ListItem>
              <strong>Progressive Enhancement:</strong> Start with basic validation, add async
              checks
            </ListItem>
            <ListItem>
              <strong>Clear Error Messages:</strong> Provide specific, actionable error information
            </ListItem>
            <ListItem>
              <strong>Loading States:</strong> Show progress during async validation and submission
            </ListItem>
            <ListItem>
              <strong>Accessibility:</strong> Proper ARIA labels and error associations
            </ListItem>
            <ListItem>
              <strong>Error Recovery:</strong> Allow users to easily correct and retry
            </ListItem>
          </UnorderedList>
        </Box>
      </VStack>
    </Container>
  );
};

export default FormValidation;
