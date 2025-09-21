// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/TransactionDemo.tsx
// Description: Transaction demo example page
// Last synced: Sun Sep 21 14:32:35 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import Section from '@/components/Section.tsx';
import CodeTabs from '@/components/CodeTabs.tsx';
import TransactionDemoComponent from '../../components/examples/TransactionDemoComponent';

const TransactionDemo: React.FC = () => {

  return (
    <Container maxW="container.xl" py={8}>
      <Heading variant="page"> Transaction System Example</Heading>
      <VStack layerStyle="section" spacing={8}>
        <Text fontSize="lg" color="gray.600" maxW="2xl">
          A comprehensive example demonstrating Forestry 4's transaction system for atomic
          operations, rollback capabilities, and complex state management scenarios.
        </Text>

        {/* Key Features */}
        <Section title="Features Demonstrated">
          <List spacing={2}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Atomic Operations:</strong> Multi-step operations that succeed or fail as a
              unit
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Automatic Rollback:</strong> State restoration when transactions fail
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Validation Control:</strong> Suspend/resume validation during transactions
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Nested Transactions:</strong> Complex operations with multiple transaction
              levels
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Error Handling:</strong> Graceful failure handling with detailed error
              information
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Performance Optimization:</strong> Batch operations for better performance
            </ListItem>
          </List>
        </Section>

        {/* Live Interactive Demo */}
        <Section title="Live Transaction Demo">
          <Text color="gray.600" mb={4}>
            Try the interactive demo below to see transactions in action. Notice how operations are atomic - they either complete successfully or roll back completely.
          </Text>

          <TransactionDemoComponent />
        </Section>

        {/* Transaction Concepts */}
        <Section title="Transaction Concepts">
          <Alert status="info" mb={4}>
            <AlertIcon />
            Transactions ensure data consistency by treating multiple operations as a single, atomic
            unit that either completes entirely or rolls back completely.
          </Alert>

          <Box>
            <Heading size="sm" mb={2}>
              Atomicity
            </Heading>
            <Text fontSize="sm" color="gray.600">
              All operations within a transaction succeed together or fail together. No partial
              updates are left in an inconsistent state.
            </Text>
          </Box>

          <Box>
            <Heading size="sm" mb={2}>
              Rollback Safety
            </Heading>
            <Text fontSize="sm" color="gray.600">
              If any operation fails, the entire transaction is rolled back to the original state
              before the transaction began.
            </Text>
          </Box>

          <Box>
            <Heading size="sm" mb={2}>
              Validation Control
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Validation can be suspended during transactions to allow intermediate invalid states,
              then resumed for final validation.
            </Text>
          </Box>

          <Box>
            <Heading size="sm" mb={2}>
              Performance Benefits
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Batch multiple operations together to reduce validation overhead and improve
              performance for complex state changes.
            </Text>
          </Box>
        </Section>

        {/* Source Code */}
        <Section title="Source Code">
          <Text color="gray.600" mb={4}>
            Here's the complete implementation showing modern Forestry 4.1.x transaction patterns with comprehensive testing:
          </Text>

          <CodeTabs
            tabs={[
              {
                label: 'Demo Component',
                language: 'tsx',
                snippet: 'TransactionDemo-component',
              },
              {
                label: 'Store Factory',
                language: 'typescript',
                snippet: 'transactionDemoStoreFactory',
              },
              {
                label: 'Unit Tests',
                language: 'typescript',
                snippet: 'transaction-demo-example-tests',
              },
            ]}
          />
        </Section>



        {/* Best Practices */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Transaction Best Practices
          </Heading>
          <List spacing={3}>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Use for Multi-Step Operations:</strong> Any operation that requires multiple
              state changes
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Suspend Validation Wisely:</strong> Suspend for intermediate states, validate
              at the end
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Handle Errors Gracefully:</strong> Provide meaningful error messages and
              recovery options
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Keep Transactions Focused:</strong> Don't make transactions too large or
              complex
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Test Rollback Scenarios:</strong> Ensure your error handling and rollback
              logic works
            </ListItem>
            <ListItem>
              <ListIcon as={CheckCircleIcon} color="green.500" />
              <strong>Use for Performance:</strong> Batch operations to reduce validation overhead
            </ListItem>
          </List>
        </Box>
      </VStack>
    </Container>
  );
};

export default TransactionDemo;
