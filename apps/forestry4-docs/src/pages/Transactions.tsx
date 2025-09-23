import React from 'react';
import {
  Box,
  Code,
  Container,
  Divider,
  Heading,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import CodeBlock from '@/components/CodeBlock';
import CodeTabs from '@/components/CodeTabs.tsx';
import ItemDef from '@/components/ItemDef';
import useErrorHandler from '@/hooks/useErrorHandler';
import Section from '../components/Section';
import TransactionDemoComponent from '@/components/examples/TransactionDemoComponent';

const Transactions: React.FC = () => {
  const { handleError } = useErrorHandler();

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading variant="page">Transaction System</Heading>
          <Text textStyle="hero">
            Forestry 4's transaction system provides atomic operations with automatic rollback,
            optional validation suspension, and nested transaction support for complex business
            operations. Not only does a transaction ensure complex operations succeed or fail as a
            unit, it also clamps update notification; subscribers only update after the action
            completes, so you can do multiple operations inside a transactions function and only
            output one update to subscribers.
          </Text>
        </Box>

        {/* Core Concepts */}
        <Section title="Core Transaction Concepts">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box>
              <Heading size="md" mb={3} color="green.600">
                <CheckCircleIcon mr={2} />
                Atomic Operations
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                All operations within a transaction succeed or fail together. No partial updates.
              </Text>
              <List spacing={2} fontSize="sm">
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Multiple state changes grouped together
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Automatic rollback on any failure
                </ListItem>
                <ListItem>
                  <ListIcon as={CheckCircleIcon} color="green.500" />
                  Maintains data consistency
                </ListItem>
              </List>
            </Box>
            <Box>
              <Heading size="md" mb={3} color="blue.600">
                <InfoIcon mr={2} />
                Validation Suspension
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Temporarily allow invalid intermediate states during complex operations.
              </Text>
              <List spacing={2} fontSize="sm">
                <ListItem>
                  <ListIcon as={InfoIcon} color="blue.500" />
                  Suspend validation during transaction
                </ListItem>
                <ListItem>
                  <ListIcon as={InfoIcon} color="blue.500" />
                  Final state must still be valid
                </ListItem>
                <ListItem>
                  <ListIcon as={InfoIcon} color="blue.500" />
                  Enables complex multi-step operations
                </ListItem>
              </List>
            </Box>
          </SimpleGrid>

          <Box>
            <Heading size="md" mb={3} color="purple.600">
              <WarningIcon mr={2} />
              Nested Transactions
            </Heading>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Transactions can be nested, with inner transactions rolling back to outer transaction
              boundaries.
            </Text>
            <List spacing={2} fontSize="sm">
              <ListItem>
                <ListIcon as={WarningIcon} color="purple.500" />
                Inner transactions can be caught and handled
              </ListItem>
              <ListItem>
                <ListIcon as={WarningIcon} color="purple.500" />
                Outer transaction continues if inner error is caught
              </ListItem>
              <ListItem>
                <ListIcon as={WarningIcon} color="purple.500" />
                Uncaught errors bubble up and rollback all levels; use try/catch to interrupt
                cascading failure
              </ListItem>
            </List>
          </Box>
        </Section>

        {/* Live Demo */}
        <Section title="Live Transaction Demo">
          <Text color="gray.600" mb={6}>
            This comprehensive banking demo shows atomic transactions in action. Try different
            operations to see how transactions ensure data consistency and automatic rollback on
            failures.
          </Text>

          <TransactionDemoComponent />
        </Section>

        {/* Real Component Examples */}
        <Section title="Source Code">
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
        {/* API Reference */}
        <Section title="Transaction API">
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={3}>
                Basic Transaction Syntax
              </Heading>
              <CodeBlock
                snippetName="basicTransactionSyntax"
                folder="Transactions"
                language="typescript"
              />
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                Transaction Parameters
              </Heading>
              <Box p={4} bg="gray.50" borderRadius="md">
                <VStack spacing={3} align="stretch">
                  <ItemDef
                    title="suspendValidation: boolean"
                    titleAsCode={true}
                    language="typescript"
                    codeTitle="Validation Suspension Example"
                    snippetName="suspendValidationExample"
                    snippetFolder="Transactions"
                  >
                    When <Code>true</Code>, validation is suspended during the transaction, allowing
                    temporarily invalid states. Final state must still be valid.
                  </ItemDef>

                  <ItemDef
                    title="action: (value: DataType) => void"
                    titleAsCode={true}
                    language="typescript"
                    codeTitle="Action Function Example"
                    snippetName="actionFunctionExample"
                    snippetFolder="Transactions"
                  >
                    The function containing all operations to be executed atomically. Use
                    <Code>this.$</Code> to call other actions within the transaction. Actions{' '}
                    <i>cannot be lambdas / arrow functions</i> and must be <b>synchronous</b>.
                    Transactional integrity cannot be maintained over async operations, but you can
                    call transactions from inside async functions (as long as the action itself is
                    sync).
                  </ItemDef>
                </VStack>
              </Box>
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                Error Handling & Rollback
              </Heading>
              <CodeBlock
                snippetName="errorHandlingRollback"
                folder="Transactions"
                language="typescript"
              />
            </Box>
          </VStack>
        </Section>

        {/* Best Practices */}
        <Section title="Best Practices">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Heading size="sm" color="green.600" mb={2}>
                  ✅ Best Practices
                </Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    Use transactions for multi-step operations that must succeed or fail together
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    Suspend validation when intermediate states may be temporarily invalid
                  </ListItem>
                  <ListItem>
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    Handle transaction errors gracefully with try/catch
                  </ListItem>
                </List>
              </Box>
            </VStack>

            <VStack spacing={4} align="stretch">
              <Box>
                <Heading size="sm" color="red.600" mb={2}>
                  ❌ These won't work
                </Heading>
                <List spacing={2} fontSize="sm">
                  <ListItem>
                    <ListIcon as={WarningIcon} color="red.500" />
                    Don't use transactions for simple single-step operations
                  </ListItem>
                  <ListItem>
                    <ListIcon as={WarningIcon} color="red.500" />
                    Don't expect suspended transactions to permanently sidestep validation. the
                    suspendValidation only is in effect until the close of the function.
                  </ListItem>
                  <ListItem>
                    <ListIcon as={WarningIcon} color="red.500" />
                    Don't perform async operations inside transaction functions
                  </ListItem>
                  <ListItem>
                    <ListIcon as={WarningIcon} color="red.500" />
                    action <b>must</b> be a function - they are bound to the store instance which
                    does not work for lambdas
                  </ListItem>
                </List>
              </Box>
            </VStack>
          </SimpleGrid>
        </Section>

        {/* Troubleshooting */}
        <Section title="Troubleshooting">
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={3} color="orange.600">
                Common Issues & Solutions
              </Heading>

              <VStack spacing={4} align="stretch">
                <Box p={4} bg="orange.50" borderRadius="md" border="1px" borderColor="orange.200">
                  <Text fontWeight="semibold" color="orange.800" mb={2}>
                    "Transaction failed but state seems unchanged"
                  </Text>
                  <Text fontSize="sm" color="gray.700" mb={2}>
                    This is expected behavior. When a transaction fails, all changes are rolled back
                    automatically.
                  </Text>
                  <CodeBlock
                    snippetName="transactionErrorCheck"
                    folder="Transactions"
                    language="typescript"
                  />
                </Box>

                <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                  <Text fontWeight="semibold" color="red.800" mb={2}>
                    "Validation errors even with suspendValidation: true"
                  </Text>
                  <Text fontSize="sm" color="gray.700" mb={2}>
                    <Code>suspendValidation</Code> only suspends validation during the transaction.
                    The final state must still pass all validation rules.
                  </Text>
                  <CodeBlock
                    snippetName="validationErrorExample"
                    folder="Transactions"
                    language="typescript"
                  />
                </Box>

                <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                  <Text fontWeight="semibold" color="blue.800" mb={2}>
                    "Nested transaction behavior is confusing"
                  </Text>
                  <Text fontSize="sm" color="gray.700" mb={2}>
                    Inner transactions can be caught and handled. Only uncaught errors bubble up to
                    outer transactions.
                  </Text>
                  <CodeBlock
                    snippetName="nestedTransactionExample"
                    folder="Transactions"
                    language="typescript"
                  />
                </Box>
              </VStack>
            </Box>

            <Box>
              <Heading size="md" mb={3}>
                Debugging Transactions
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Use the transaction stack observer to debug complex transaction flows:
              </Text>

              <CodeBlock
                snippetName="transactionDebugging"
                folder="Transactions"
                language="typescript"
              />
            </Box>
          </VStack>
        </Section>
      </VStack>
    </Container>
  );
};

export default Transactions;
