import React from 'react';
import { Badge, Box, Button, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import useForestryLocal from '@/hooks/useForestryLocal.ts';
import useToast from '@/hooks/useToast.ts';

import formStateFactory, { FormState } from '@/storeFactories/ValidationSystem/form/formState.ts';
import { usernameBranchConfig } from '@/storeFactories/ValidationSystem/form/usernameBranch.ts';
import { emailBranchConfig } from '@/storeFactories/ValidationSystem/form/emailBranch.ts';
import { ageBranchConfig } from '@/storeFactories/ValidationSystem/form/ageBranch.ts';
import Field from '@/components/ValidationSystem/Field';
import Section from '../Section';

const AdvancedFormDemo: React.FC = () => {
  const { handleSuccess, handleError } = useToast();

  const [formState, formForest] = useForestryLocal<FormState>(
    formStateFactory,
    handleError,
    handleSuccess
  );

  return (
    <Section>
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
    </Section>
  );
};

export default AdvancedFormDemo;
