import React from 'react';
import { Container, VStack, Heading, Text, Box, Alert, AlertIcon } from '@chakra-ui/react';
import ShoppingCartDemo from '@/components/ValidationSystem/ShoppingCartDemo.tsx';
import AdvancedFormDemo from '@/components/ValidationSystem/AdvancedFormDemo.tsx';
import ValidationGuide from '@/components/ValidationSystem/ValidationGuide.tsx';

const ValidationSystem: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Validation System
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Learn about Forestry 4's comprehensive validation system with practical examples of
            schema validation, business logic tests, and UI state management.
          </Text>
        </Box>

        <Alert status="info">
          <AlertIcon />
          <Text fontSize="sm">
            <strong>Three-Layer Validation:</strong> Use Zod for type safety, test functions for
            critical business rules, and prep functions for UI state. Each component below
            demonstrates these patterns in action.
          </Text>
        </Alert>

        {/* Use Case Components */}
        <ShoppingCartDemo />
        <AdvancedFormDemo />
        <ValidationGuide />
      </VStack>
    </Container>
  );
};

export default ValidationSystem;
