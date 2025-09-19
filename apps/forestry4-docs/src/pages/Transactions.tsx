import React from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Code,
  Container,
  Divider,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { CheckCircleIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import CodeBlock from '@/components/CodeBlock';
import CodeTabs from '@/components/CodeTabs';
import ItemDef from '@/components/ItemDef';
import SnippetBlock from '@/components/SnippetBlock';
import useForestryLocal from '@/hooks/useForestryLocal';
import useErrorHandler from '@/hooks/useErrorHandler';
import { createTransactionDemoStore } from '@/storeFactories/createTransactionDemoStore.tsx';
import Section from '../components/Section';

const Transactions: React.FC = () => {
  return ''; // TEMPORARILY DISABLED FOR 4.1.3 MIGRATION
  const { handleError } = useErrorHandler();

  const [demoState, demoStore] = useForestryLocal(createTransactionDemoStore, handleError);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={4}>
            Transaction System
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            Forestry 4's transaction system provides atomic operations with automatic rollback,
            validation suspension, and nested transaction support for complex business operations.
            Not only does a transaction ensure complex operations succeed or fail as a unit, it also
            reduces the number of updates to subscribers; since subscribers only update after all of
            the actions' body is complete, you can do multiple operations inside a transactions
            function and only output one update to subscribers. If transactions are nested the
            outermost transaction constrains the output.
          </Text>

          <Alert status="info" mb={6}>
            <AlertIcon />
            <Box>
              <Text fontWeight="semibold">Key Benefits</Text>
              <Text fontSize="sm" mt={1}>
                Transactions ensure data consistency by grouping multiple operations into atomic
                units. If any operation fails, all changes are automatically rolled back to maintain
                data integrity.
              </Text>
            </Box>
          </Alert>
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

            <Divider my={6} />

            <Box>
              <Heading size="md" mb={3} color="purple.600">
                <WarningIcon mr={2} />
                Nested Transactions
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Transactions can be nested, with inner transactions rolling back to outer
                transaction boundaries.
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
              This banking demo shows atomic transactions in action. Try the payroll processing to
              see how multiple operations are grouped together.
            </Text>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Account Status */}
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold">Account Balance</Text>
                    <Badge colorScheme="green" fontSize="lg">
                      ${demoState.balance.toFixed(2)}
                    </Badge>
                  </HStack>
                  {demoState.pendingOperations > 0 && (
                    <Text fontSize="sm" color="orange.600">
                      Processing {demoState.pendingOperations} operations...
                    </Text>
                  )}
                  {demoState.isProcessing && (
                    <Text fontSize="sm" color="blue.600">
                      Processing payroll...
                    </Text>
                  )}
                </Box>

                <VStack spacing={2}>
                  <Button
                    colorScheme="blue"
                    onClick={() => demoStore.$.safeDeposit(500, 'Demo deposit')}
                    size="sm"
                    width="full"
                  >
                    Deposit $500
                  </Button>

                  <Button
                    colorScheme="orange"
                    onClick={() => demoStore.$.safeTransfer(200, 'Demo transfer')}
                    size="sm"
                    width="full"
                  >
                    Transfer $200
                  </Button>

                  <Button
                    colorScheme="green"
                    onClick={() => demoStore.$.handlePayrollDemo()}
                    isLoading={demoState.isProcessing}
                    loadingText="Processing..."
                    size="sm"
                    width="full"
                  >
                    Process Payroll ($950)
                  </Button>

                  <Button
                    colorScheme="red"
                    variant="outline"
                    onClick={() => demoStore.$.handleFailedPayroll()}
                    size="sm"
                    width="full"
                  >
                    Try Failed Payroll ($1800)
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => demoStore.$.reset()}
                    size="sm"
                    width="full"
                  >
                    Reset Demo
                  </Button>
                </VStack>
              </VStack>

              {/* Transaction History */}
              <Box>
                <Heading size="md" mb={3}>
                  Recent Transactions
                </Heading>
                <Box
                  maxHeight="300px"
                  overflowY="auto"
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  p={3}
                >
                  {demoState.transactions.length === 0 ? (
                    <Text color="gray.500" textAlign="center" py={4}>
                      No transactions yet
                    </Text>
                  ) : (
                    <VStack spacing={2} align="stretch">
                      {demoState.transactions
                        .slice(-10)
                        .reverse()
                        .map((transaction) => (
                          <Box
                            key={transaction.id}
                            p={2}
                            bg={transaction.amount > 0 ? 'green.50' : 'red.50'}
                            borderRadius="sm"
                            fontSize="sm"
                          >
                            <HStack justify="space-between">
                              <Text>{transaction.description}</Text>
                              <Text
                                fontWeight="semibold"
                                color={transaction.amount > 0 ? 'green.600' : 'red.600'}
                              >
                                {transaction.amount > 0 ? '+' : ''}${transaction.amount.toFixed(2)}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {new Date(transaction.timestamp).toLocaleTimeString()}
                            </Text>
                          </Box>
                        ))}
                    </VStack>
                  )}
                </Box>
              </Box>
            </SimpleGrid>
          
        </Section>

        {/* API Reference */}
        <Section title="Transaction API">

            <VStack spacing={6} align="stretch">
              <Box>
                <Heading size="md" mb={3}>
                  Basic Transaction Syntax
                </Heading>
                <SnippetBlock
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
                      snippetName="suspendValidationExample"
                      snippetFolder="Transactions"
                      codeTitle="Validation Suspension Example"
                    >
                      When <Code>true</Code>, validation is suspended during the transaction,
                      allowing temporarily invalid states. Final state must still be valid.
                    </ItemDef>

                    <ItemDef
                      title="action: (value: DataType) => void"
                      titleAsCode={true}
                      snippetName="actionFunctionExample"
                      snippetFolder="Transactions"
                      codeTitle="Action Function Example"
                    >
                      The function containing all operations to be executed atomically. Use
                      <Code>this.$</Code> to call other actions within the transaction. Actions{' '}
                      <i>cannot be lambdas / arrow functions</i> and must be <b>synchronous</b>.
                      Transactional integrity cannot be maintained over async operations, but you
                      can call transactions from inside async functions (as long as the action
                      itself is sync).
                    </ItemDef>
                  </VStack>
                </Box>
              </Box>

              <Box>
                <Heading size="md" mb={3}>
                  Error Handling & Rollback
                </Heading>
                <SnippetBlock
                  snippetName="errorHandlingRollback"
                  folder="Transactions"
                  language="typescript"
                />
              </Box>
            </VStack>
          
        </Section>

        {/* Advanced Examples */}
        <Section title="Advanced Transaction Patterns">

            <CodeTabs
              tabs={[
                {
                  label: 'Shopping Cart Checkout',
                  language: 'typescript',
                  code: `// Complex e-commerce checkout process
const checkoutActions = {
  processCheckout(value, paymentInfo, shippingInfo) {
    this.transact({
      suspendValidation: true,
      action() {
        // Step 1: Validate cart isn't empty
        if (this.value.items.length === 0) {
          throw new Error('Cart is empty')
        }

        // Step 2: Reserve inventory (may temporarily create negative stock)
        for (const item of this.value.items) {
          this.$.reserveInventory(item.productId, item.quantity)
        }

        // Step 3: Process payment
        const paymentResult = this.$.processPayment(
          this.value.totalAmount,
          paymentInfo
        )

        // Step 4: Create order record
        const orderId = this.$.createOrder({
          items: this.value.items,
          paymentId: paymentResult.id,
          shipping: shippingInfo,
          total: this.value.totalAmount
        })

        // Step 5: Clear cart and update user's order history
        this.$.clearCart()
        this.$.addToOrderHistory(orderId)

        // Step 6: Send confirmation email
        this.$.sendOrderConfirmation(orderId, paymentInfo.email)
      }
    })
  }
}`,
                },
                {
                  label: 'Nested Transactions',
                  language: 'typescript',
                  code: `// Nested transactions with error recovery
const batchActions = {
  processBatchUpdates(value, updates) {
    this.transact({
      suspendValidation: true,
      action() {
        const results = []
        const errors = []

        for (const update of updates) {
          try {
            // Inner transaction for each update
            this.transact({
              action() {
                this.$.validateUpdate(update)
                this.$.applyUpdate(update)
                this.$.logUpdate(update.id)
              }
            })
            results.push({ id: update.id, status: 'success' })
          } catch (error) {
            // Catch inner transaction error, continue with batch
            errors.push({ id: update.id, error: error.message })
          }
        }

        // Update batch results
        this.$.setBatchResults(results, errors)

        // If too many errors, fail the entire batch
        if (errors.length > updates.length * 0.5) {
          throw new Error(\`Batch failed: \${errors.length} of \${updates.length} updates failed\`)
        }
      }
    })
  }
}`,
                },
                {
                  label: 'Transaction Monitoring',
                  language: 'typescript',
                  code: `// Monitor transaction stack for debugging
const store = new Store({
  value: { count: 0, operations: [] },
  actions: {
    complexOperation(value) {
      this.transact({
        suspendValidation: true,
        action() {
          this.$.step1()
          this.$.step2()
          this.$.step3()
        }
      })
    }
  }
})

// Subscribe to transaction stack changes
const stackSubscription = store.observeTransStack((stack) => {
  console.log('Transaction stack:', stack.map(t => ({
    id: t.id,
    isTransaction: t.isTransaction,
    suspendValidation: t.suspendValidation
  })))
})

// Monitor for debugging
store.$.complexOperation()

// Clean up
stackSubscription.unsubscribe()`,
                },
                {
                  label: 'Safe Action Patterns',
                  language: 'typescript',
                  code: `// Pattern for creating safe actions that handle transaction errors
function createStoreWithSafeActions(errorHandler) {
  return new Store({
    value: { data: [], status: 'idle' },

    actions: {
      // Regular actions that can throw
      dangerousUpdate(value, newData) {
        this.transact({
          action() {
            this.$.validateData(newData)
            this.$.updateData(newData)
            this.$.notifySubscribers()
          }
        })
      },

      // Safe versions that catch and handle errors
      ...(errorHandler ? {
        safeDangerousUpdate(value, newData) {
          try {
            this.$.dangerousUpdate(newData)
          } catch (error) {
            errorHandler(error, 'Update Failed')
            // Optionally set error state
            this.next({ ...this.value, status: 'error' })
          }
        }
      } : {})
    }
  })
}

// Usage with error handling
const { handleError } = useErrorHandler()
const store = createStoreWithSafeActions(handleError)

// Use safe actions in UI
<Button onClick={() => store.$.safeDangerousUpdate(newData)}>
  Update Data
</Button>`,
                },
              ]}
            />
          
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
                      Keep transaction functions focused and atomic
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      Use <Code>this.$</Code> to call other actions within transactions
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
                    ❌ Avoid This
                  </Heading>
                  <List spacing={2} fontSize="sm">
                    <ListItem>
                      <ListIcon as={WarningIcon} color="red.500" />
                      Don't use transactions for simple single-step operations
                    </ListItem>
                    <ListItem>
                      <ListIcon as={WarningIcon} color="red.500" />
                      Don't nest transactions unnecessarily deep
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
                      This is expected behavior. When a transaction fails, all changes are rolled
                      back automatically.
                    </Text>
                    <CodeBlock language="typescript">
                      {`// Check transaction errors
try {
  store.transact({
    action() {
      this.$.step1() // ✅ Success
      this.$.step2() // ❌ Fails here
      this.$.step3() // Never executed
    }
  })
} catch (error) {
  console.log('Transaction rolled back:', error.message)
  // Store state is exactly as it was before the transaction
}`}
                    </CodeBlock>
                  </Box>

                  <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                    <Text fontWeight="semibold" color="red.800" mb={2}>
                      "Validation errors even with suspendValidation: true"
                    </Text>
                    <Text fontSize="sm" color="gray.700" mb={2}>
                      <Code>suspendValidation</Code> only suspends validation during the
                      transaction. The final state must still pass all validation rules.
                    </Text>
                    <CodeBlock language="typescript">
                      {`store.transact({
  suspendValidation: true,
  action() {
    // These intermediate states can be invalid
    this.next({ balance: -100 }) // Temporarily negative
    this.next({ balance: 50 })   // Still negative

    // But final state must be valid
    this.next({ balance: 200 })  // ✅ Valid final state
  }
})`}
                    </CodeBlock>
                  </Box>

                  <Box p={4} bg="blue.50" borderRadius="md" border="1px" borderColor="blue.200">
                    <Text fontWeight="semibold" color="blue.800" mb={2}>
                      "Nested transaction behavior is confusing"
                    </Text>
                    <Text fontSize="sm" color="gray.700" mb={2}>
                      Inner transactions can be caught and handled. Only uncaught errors bubble up
                      to outer transactions.
                    </Text>
                    <CodeBlock language="typescript">
                      {`store.transact({
  action() {
    try {
      // Inner transaction that might fail
      this.transact({
        action() {
          this.$.riskyOperation() // Might throw
        }
      })
    } catch (innerError) {
      // Handle inner transaction failure
      this.$.handleError(innerError)
      // Outer transaction continues
    }

    this.$.finalStep() // This still executes
  }
})`}
                    </CodeBlock>
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

                <CodeBlock language="typescript">
                  {`// Enable transaction debugging
const debugSub = store.observeTransStack((stack) => {
  console.log('Transaction Stack:', stack.map(t => ({
    id: t.id.slice(-8), // Show last 8 chars of ID
    isTransaction: t.isTransaction,
    suspendValidation: t.suspendValidation,
    hasValue: !!t.value
  })))
})

// Your transaction code here
store.transact({
  suspendValidation: true,
  action() {
    // Watch the console to see stack changes
    this.$.complexOperation()
  }
})

// Clean up when done
debugSub.unsubscribe()`}
                </CodeBlock>
              </Box>
            </VStack>
          
        </Section>
      </VStack>
    </Container>
  );
};

export default Transactions;
