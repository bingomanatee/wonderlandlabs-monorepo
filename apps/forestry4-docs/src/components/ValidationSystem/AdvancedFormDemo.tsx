import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Input,
  NumberInput,
  NumberInputField,
  Alert,
  AlertIcon,
  Badge,
} from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal.ts';
import useForestBranch from '@/hooks/useForestBranch.ts';
import useErrorHandler from '@/hooks/useErrorHandler.ts';

import formStateFactory from '@/storeFactories/ValidationSystem/formState.ts';
import { usernameBranchConfig } from '@/storeFactories/ValidationSystem/usernameBranch.ts';
import { emailBranchConfig } from '@/storeFactories/ValidationSystem/emailBranch.ts';
import { ageBranchConfig } from '@/storeFactories/ValidationSystem/ageBranch.ts';
import CodeTabs from '@/components/CodeTabs';
import ErrorField from '@/components/ErrorField';

const AdvancedFormDemo: React.FC = () => {
  const { handleSuccess } = useErrorHandler();

  // Advanced form using extracted store factory
  const [formState, formForest] = useForestryLocal(formStateFactory);

  // Form field branches using the new useForestBranch hook - no error handler needed
  const [usernameField, usernameBranch] = useForestBranch(
    formForest,
    'username',
    usernameBranchConfig()
  );
  const [emailField, emailBranch] = useForestBranch(formForest, 'email', emailBranchConfig());
  const [ageField, ageBranch] = useForestBranch(formForest, 'age', ageBranchConfig());

  return (
    <Card>
      <CardBody>
        <VStack spacing={6} align="stretch">
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

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Form Fields</Heading>

              <Box>
                <Text mb={2} fontWeight="semibold">
                  Username
                </Text>
                <Input
                  value={usernameField.value}
                  onChange={usernameBranch.$.setValueFromEvent}
                  borderColor={usernameField.isValid ? 'gray.200' : 'red.300'}
                />
                {!usernameField.isValid && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {usernameField.errorString}
                  </Text>
                )}

                <ErrorField field={usernameField} branch={usernameBranch} fieldType="username" />
              </Box>

              <Box>
                <Text mb={2} fontWeight="semibold">
                  Email
                </Text>
                <Input
                  type="email"
                  value={emailField.value}
                  onChange={emailBranch.$.setValueFromEvent}
                  borderColor={emailField.isValid ? 'gray.200' : 'red.300'}
                />
                {!emailField.isValid && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {emailField.errorString}
                  </Text>
                )}

                <ErrorField field={emailField} branch={emailBranch} fieldType="email" />
              </Box>

              <Box>
                <Text mb={2} fontWeight="semibold">
                  Age
                </Text>
                <NumberInput value={ageField.value} onChange={ageBranch.$.setValueFromEvent}>
                  <NumberInputField borderColor={ageField.isValid ? 'gray.200' : 'red.300'} />
                </NumberInput>
                {!ageField.isValid && (
                  <Text fontSize="sm" color="red.500" mt={1}>
                    {ageField.errorString}
                  </Text>
                )}

                <ErrorField field={ageField} branch={ageBranch} fieldType="age" />
              </Box>

              <VStack spacing={3} align="stretch">
                <Button
                  colorScheme="forest"
                  isDisabled={!formState.canSubmit}
                  onClick={() => {
                    if (formState.canSubmit) {
                      formForest.$.setSubmitting(true);
                      setTimeout(() => {
                        formForest.$.setSubmitting(false);
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
                  Validation Status:
                </Text>
                <HStack>
                  <Text>Username:</Text>
                  <Badge colorScheme={formState.username.isValid ? 'green' : 'red'}>
                    {formState.username.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </HStack>
                <HStack>
                  <Text>Email:</Text>
                  <Badge colorScheme={formState.email.isValid ? 'green' : 'red'}>
                    {formState.email.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </HStack>
                <HStack>
                  <Text>Age:</Text>
                  <Badge colorScheme={formState.age.isValid ? 'green' : 'red'}>
                    {formState.age.isValid ? 'Valid' : 'Invalid'}
                  </Badge>
                </HStack>
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
            </VStack>
          </SimpleGrid>

          {/* Source Code Section */}
          <Box>
            <Heading size="md" mb={4}>Source Code - Forest Branches & Field Validation</Heading>
            <Text color="gray.600" mb={4}>
              Here's how to implement advanced form validation using Forest branches with individual field state management:
            </Text>

            <CodeTabs
              tabs={[
                {
                  label: 'useForestBranch Hook',
                  language: 'typescript',
                  code: `// hooks/useForestBranch.ts
import { useEffect, useState } from 'react';
import type { StoreIF } from '@wonderlandlabs/forestry4';

export default function useForestBranch<T>(
  store: StoreIF<any>,
  path: string,
  storeParams: Partial<StoreParams<T>>
): [T, StoreIF<T>] {
  const [branchStore, setBranchStore] = useState<StoreIF<T> | null>(null);
  const [branchValue, setBranchValue] = useState<T>();

  useEffect(() => {
    // Create branch from Forest (only Forest instances can branch)
    const branch = store.branch(path, storeParams);
    setBranchStore(branch);
    setBranchValue(branch.value);

    // Subscribe to branch changes
    const subscription = branch.subscribe((newValue: T) => {
      setBranchValue(newValue);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [store, path]);

  return [branchValue!, branchStore!];
}`
                },
                {
                  label: 'Form Component',
                  language: 'tsx',
                  code: `// Advanced form with branches
const AdvancedFormDemo: React.FC = () => {
  // Main form Forest
  const [formState, formForest] = useForestryLocal(formStateFactory);

  // Individual field branches
  const [usernameState, usernameStore] = useForestBranch(
    formForest, 'username', usernameBranchConfig
  );
  const [emailState, emailStore] = useForestBranch(
    formForest, 'email', emailBranchConfig
  );
  const [ageState, ageStore] = useForestBranch(
    formForest, 'age', ageBranchConfig
  );

  return (
    <VStack spacing={4}>
      <Input
        placeholder="Username"
        value={usernameState.value}
        onChange={usernameStore.$.setValueFromEvent}
        isInvalid={!usernameState.isValid}
      />
      {!usernameState.isValid && (
        <Text color="red.500" fontSize="sm">
          {usernameState.errorString}
        </Text>
      )}
    </VStack>
  );
};`
                },
                {
                  label: 'Branch Configuration',
                  language: 'typescript',
                  code: `// storeFactories/ValidationSystem/usernameBranch.ts
import type { FormField } from '@/types';

export const usernameBranchConfig = {
  value: { value: '', isValid: true, errorString: '' },

  actions: {
    setValueFromEvent: function(value: FormField<string>, event: React.ChangeEvent<HTMLInputElement>) {
      this.$.setValue(event.target.value)
    }
  },

  // UI validation in prep function (not critical business rules)
  prep: function(input: FormField<string>, current: FormField<string>) {
    const result = { ...current, ...input }

    // UI validation for user feedback
    if (result.value.length < 3) {
      result.isValid = false
      result.errorString = 'Username must be at least 3 characters'
    } else if (result.value.length > 20) {
      result.isValid = false
      result.errorString = 'Username cannot exceed 20 characters'
    } else {
      result.isValid = true
      result.errorString = ''
    }

    return result
  }
}`
                },
                {
                  label: 'Forest Factory',
                  language: 'typescript',
                  code: `// storeFactories/ValidationSystem/formState.ts
import { Forest } from '@wonderlandlabs/forestry4';
import type { AdvancedForm } from '@/types';

export default function formStateFactory() {
  return new Forest<AdvancedForm>({
    name: 'advanced-form',
    value: {
      username: { value: '', isValid: true, errorString: '' },
      email: { value: '', isValid: true, errorString: '' },
      age: { value: 0, isValid: true, errorString: '' },
      isSubmitting: false,
      canSubmit: false,
      submitError: ''
    },

    actions: {
      setSubmitting: function (value: AdvancedForm, isSubmitting: boolean) {
        this.set('isSubmitting', isSubmitting);
      }
    },

    // Calculate form-level state from field states
    prep: function(input: AdvancedForm, current: AdvancedForm) {
      const result = { ...current, ...input }

      // Form can submit if all fields are valid and not currently submitting
      result.canSubmit = result.username.isValid &&
                        result.email.isValid &&
                        result.age.isValid &&
                        !result.isSubmitting

      // Set submit error message
      if (!result.canSubmit && !result.isSubmitting) {
        result.submitError = 'Please fix validation errors before submitting'
      } else {
        result.submitError = ''
      }

      return result
    }
  })
}`
                }
              ]}
            />
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default AdvancedFormDemo;
