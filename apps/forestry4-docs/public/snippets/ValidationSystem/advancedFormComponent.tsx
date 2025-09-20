import React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal';
import useErrorHandler from '@/hooks/useErrorHandler';

import formStateFactory, { FormState } from '@/storeFactories/ValidationSystem/formState';
import { usernameBranchConfig } from '@/storeFactories/ValidationSystem/usernameBranch';
import { emailBranchConfig } from '@/storeFactories/ValidationSystem/emailBranch';
import { ageBranchConfig } from '@/storeFactories/ValidationSystem/ageBranch';
import Field from '@/components/ValidationSystem/Field';

const AdvancedFormDemo: React.FC = () => {
  const { handleSuccess, handleError } = useErrorHandler();

  // Advanced form using modern FormStateForest subclass
  const [formState, formForest] = useForestryLocal<FormState>(formStateFactory, handleError);

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Advanced Form - Using Forest with Branches</Heading>
      <Text color="gray.600">
        This example showcases Forestry 4's branch system. Only <strong>Forests</strong> can
        create branches - each form field is managed by its own branch with independent
        validation, while the parent forest coordinates overall form state.
      </Text>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Form Fields</Heading>

          {/* Field components handle branch creation internally */}
          <Field
            parentStore={formForest}
            path="username"
            branchFactory={usernameBranchConfig}
            placeholder="Enter username"
          />

          <Field
            parentStore={formForest}
            path="email"
            branchFactory={emailBranchConfig}
            placeholder="Enter email address"
          />

          <Field
            parentStore={formForest}
            path="age"
            branchFactory={ageBranchConfig}
            placeholder="Enter age"
          />

          <VStack spacing={3} align="stretch">
            <Button
              colorScheme="forest"
              isDisabled={!formState.canSubmit}
              onClick={() => {
                if (formState.canSubmit) {
                  // Using modern subclass methods
                  formForest.setSubmitting(true);
                  setTimeout(() => {
                    formForest.setSubmitting(false);
                    handleSuccess('Form submitted successfully!', 'Registration Complete');
                  }, 1000);
                }
              }}
              isLoading={formState.isSubmitting}
            >
              Submit Form
            </Button>

            {!formState.canSubmit && (
              <Text fontSize="sm" color="orange.600" textAlign="center">
                {formState.submitError}
              </Text>
            )}
          </VStack>
        </VStack>

        <VStack spacing={4} align="stretch">
          <Heading size="md">Form State</Heading>

          <Box p={4} bg="gray.50" borderRadius="md" fontFamily="mono" fontSize="sm">
            <Text mb={2} fontWeight="semibold">
              Current Values:
            </Text>
            <Text>Username: "{formState.username.value}"</Text>
            <Text>Email: "{formState.email.value}"</Text>
            <Text>Age: {formState.age.value}</Text>
          </Box>

          <Box p={4} bg="gray.50" borderRadius="md" fontFamily="mono" fontSize="sm">
            <Text mb={2} fontWeight="semibold">
              Form Status:
            </Text>
            <HStack>
              <Text>Can Submit:</Text>
              <Badge colorScheme={formState.canSubmit ? 'green' : 'orange'}>
                {formState.canSubmit ? 'Yes' : 'No'}
              </Badge>
            </HStack>
            <HStack>
              <Text>Submitting:</Text>
              <Badge colorScheme={formState.isSubmitting ? 'blue' : 'gray'}>
                {formState.isSubmitting ? 'Yes' : 'No'}
              </Badge>
            </HStack>
          </Box>

          {/* Demonstrate computed properties from FormStateForest */}
          <Box p={4} bg="blue.50" borderRadius="md" fontSize="sm">
            <Text mb={2} fontWeight="semibold">
              Computed Properties:
            </Text>
            <HStack>
              <Text>Form Valid:</Text>
              <Badge colorScheme={formForest.isFormValid ? 'green' : 'red'}>
                {formForest.isFormValid ? 'Yes' : 'No'}
              </Badge>
            </HStack>
            <HStack>
              <Text>Form Filled:</Text>
              <Badge colorScheme={formForest.isFormFilled ? 'green' : 'orange'}>
                {formForest.isFormFilled ? 'Yes' : 'No'}
              </Badge>
            </HStack>
            <HStack>
              <Text>Has Errors:</Text>
              <Badge colorScheme={formForest.hasErrors ? 'red' : 'green'}>
                {formForest.hasErrors ? 'Yes' : 'No'}
              </Badge>
            </HStack>
            <HStack>
              <Text>Is Dirty:</Text>
              <Badge colorScheme={formForest.isDirty ? 'blue' : 'gray'}>
                {formForest.isDirty ? 'Yes' : 'No'}
              </Badge>
            </HStack>
          </Box>
        </VStack>
      </SimpleGrid>

      <Alert status="info">
        <AlertIcon />
        <Text fontSize="sm">
          <strong>Key Points:</strong> Only <code>Forest</code> instances can create branches.
          Form submission state (<code>canSubmit</code>, <code>submitError</code>) is calculated
          in prep functions as data state, not validation errors. Field components handle
          branch creation internally using the modern <code>{`{subclass: Class}`}</code> pattern.
        </Text>
      </Alert>
    </VStack>
  );
};

export default AdvancedFormDemo;
