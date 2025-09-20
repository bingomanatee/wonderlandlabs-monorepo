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
import useForestryLocal from '@/hooks/useForestryLocal.ts';
import useErrorHandler from '@/hooks/useErrorHandler.ts';

import formStateFactory, { FormState } from '@/storeFactories/ValidationSystem/form/formState.ts';
import { usernameBranchConfig } from '@/storeFactories/ValidationSystem/form/usernameBranch.ts';
import { emailBranchConfig } from '@/storeFactories/ValidationSystem/form/emailBranch.ts';
import { ageBranchConfig } from '@/storeFactories/ValidationSystem/form/ageBranch.ts';
import CodeTabs from '@/components/CodeTabs.tsx';
import Field from '@/components/ValidationSystem/Field';
import Section from '../Section';

const AdvancedFormDemo: React.FC = () => {
  const { handleSuccess, handleError } = useErrorHandler();

  const [formState, formForest] = useForestryLocal<FormState>(
    formStateFactory,
    handleError,
    handleSuccess
  );

  return (
    <Section>
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
              • <strong>Modular design</strong> - Easy to add/remove fields without affecting others
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
                onClick={() => formForest.submit()}
                isLoading={formState.isSubmitting}
              >
                Submit Form
              </Button>
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
          </VStack>
        </SimpleGrid>

        {/* Source Code Section */}
        <Box>
          <Heading size="md" mb={4}>
            Source Code - Forest Branches & Field Validation
          </Heading>
          <Text color="gray.600" mb={4}>
            Here's how to implement advanced form validation using Forest branches with individual
            field state management:
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'useForestBranch Hook',
                language: 'typescript',
                snippet: 'useForestBranchSource',
                folder: 'IntegrationHooks',
                ts: true,
              },
              {
                label: 'Form Component',
                language: 'tsx',
                snippet: 'advancedFormComponent',
                folder: 'ValidationSystem',
                tsx: true,
              },
              {
                label: 'Branch Configuration',
                language: 'typescript',
                snippet: 'usernameBranchConfig',
                folder: 'ValidationSystem',
                ts: true,
              },
              {
                label: 'Forest Factory',
                language: 'typescript',
                snippet: 'formStateFactory',
                folder: 'ValidationSystem',
                ts: true,
              },
            ]}
          />
        </Box>
      </VStack>
    </Section>
  );
};

export default AdvancedFormDemo;
