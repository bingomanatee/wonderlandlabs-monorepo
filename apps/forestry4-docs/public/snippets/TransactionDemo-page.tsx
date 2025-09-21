// Auto-generated snippet from: apps/forestry4-docs/src/pages/examples/TransactionDemo.tsx
// Description: Transaction demo example page
// Last synced: Sat Sep 20 21:09:31 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

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
import CodeBlock from '../../components/CodeBlock';
import SnippetBlock from '../../components/SnippetBlock';

const TransactionDemo: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack layerStyle="section" spacing={8}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="xl" mb={4}>
            Transaction System Example
            <Badge ml={3} colorScheme="orange">
              Advanced Pattern
            </Badge>
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            A comprehensive example demonstrating Forestry 4's transaction system for atomic
            operations, rollback capabilities, and complex state management scenarios.
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
        </Box>

        {/* Transaction Concepts */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Transaction Concepts
          </Heading>

          <Alert status="info" mb={4}>
            <AlertIcon />
            Transactions ensure data consistency by treating multiple operations as a single, atomic
            unit that either completes entirely or rolls back completely.
          </Alert>

          <VStack spacing={4} align="stretch">
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
                Validation can be suspended during transactions to allow intermediate invalid
                states, then resumed for final validation.
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
          </VStack>
        </Box>

        {/* Basic Transaction Example */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Basic Transaction Pattern
          </Heading>
          <SnippetBlock
            snippetName="transactionDemoStoreFactory"
            language="typescript"
            title="Modern Transaction Store Factory"
          />
        </Box>

        {/* Transaction Tests Example */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Transaction Testing
          </Heading>
          <SnippetBlock
            snippetName="transaction-demo-example-tests"
            language="typescript"
            title="Comprehensive Transaction Tests"
          />
        </Box>

        {/* Modern Transaction Patterns */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Modern Transaction Patterns
          </Heading>
          <CodeBlock language="typescript" title="Forestry 4.1.x Transaction Patterns">
            {`// Modern class-based transaction patterns
class TransactionDemoForest extends Forest<BankState> {
  // Bank transfer with transaction
  transferFunds(fromAccountId: string, toAccountId: string, amount: number) {
    this.$transact({
      suspendValidation: true,
      action: () => {
        const fromAccount = this.value.bankAccounts[fromAccountId];
        const toAccount = this.value.bankAccounts[toAccountId];

        if (!fromAccount || !toAccount) {
          throw new Error('Invalid account');
        }

        if (fromAccount.balance < amount) {
          throw new Error('Insufficient funds');
        }

        // Step 1: Withdraw from source account
        this.mutate(draft => {
          draft.bankAccounts[fromAccountId].balance -= amount;
        });

        // Step 2: Deposit to destination account
        this.mutate(draft => {
          draft.bankAccounts[toAccountId].balance += amount;
        });

        // Step 3: Record transaction
        const transaction = {
          id: Date.now().toString(),
          amount,
          description: \`Transfer from \${fromAccount.name} to \${toAccount.name}\`,
          timestamp: Date.now(),
        };

        this.mutate(draft => {
          draft.bankTransactions.push(transaction);
        });
      },
    });
  }

  // Complex order processing with nested transactions
  processOrder(order: Order) {
    this.$transact({
      suspendValidation: false,
      action: () => {
        // Step 1: Validate inventory (inner transaction)
        this.$transact({
          suspendValidation: true,
          action: () => {
            for (const item of order.items) {
              const inventory = this.value.inventory[item.productId];
              if (inventory < item.quantity) {
                throw new Error(\`Insufficient inventory for \${item.name}\`);
              }
              // Reserve inventory
              this.mutate(draft => {
                draft.inventory[item.productId] -= item.quantity;
              });
            }
          },
        });

        // Step 2: Process payment (inner transaction)
        this.$transact({
          suspendValidation: true,
          action: () => {
            this.set('paymentStatus', 'processing');

            const paymentResult = this.processPayment(order.totalAmount);
            if (!paymentResult.success) {
              throw new Error(\`Payment failed: \${paymentResult.error}\`);
            }
            this.set('paymentStatus', 'completed');
          },
        });

        // Step 3: Create order
        this.mutate(draft => {
          draft.orders[order.id] = {
            ...order,
            status: 'confirmed',
            processedAt: new Date(),
          };
        });
      },
    });
  }
}`}
          </CodeBlock>
        </Box>

        {/* Error Handling */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Error Handling & Recovery
          </Heading>
          <CodeBlock language="typescript" title="Transaction Error Handling">
            {`// Comprehensive error handling in transactions
const safeDataMigration = function(value: DataState, migrationPlan: MigrationPlan) {
  return this.transact({
    suspendValidation: true,
    action() {
      try {
        // Create backup before migration
        const backup = JSON.parse(JSON.stringify(this.value));
        this.set('_backup', backup);
        
        // Step 1: Validate migration plan
        const validation = validateMigrationPlan(migrationPlan);
        if (!validation.isValid) {
          throw new Error(\`Invalid migration plan: \${validation.errors.join(', ')}\`);
        }
        
        // Step 2: Apply schema changes
        for (const change of migrationPlan.schemaChanges) {
          this.$.applySchemaChange(change);
        }
        
        // Step 3: Migrate data
        for (const transformation of migrationPlan.dataTransformations) {
          this.$.applyDataTransformation(transformation);
        }
        
        // Step 4: Validate final state
        const finalValidation = this.validate(this.value);
        if (!finalValidation.isValid) {
          throw new Error(\`Migration resulted in invalid state: \${finalValidation.error}\`);
        }
        
        // Success - remove backup
        this.set('_backup', null);
        this.set('migrationStatus', 'completed');
        
      } catch (error) {
        // Transaction will automatically rollback
        // Log error for debugging
        console.error('Migration failed:', error);
        
        // Set error state (this will be rolled back too if we throw)
        this.set('migrationError', error.message);
        
        // Re-throw to trigger rollback
        throw error;
      }
    }
  }).catch(error => {
    // Handle post-rollback cleanup
    this.set('migrationStatus', 'failed');
    this.set('lastError', error.message);
    
    // Optionally restore from backup
    if (this.value._backup) {
      this.$.restoreFromBackup();
    }
    
    throw error; // Re-throw for caller
  });
};`}
          </CodeBlock>
        </Box>

        {/* Performance Optimization */}
        <Box layerStyle="methodCard" w="full">
          <Heading size="md" mb={4}>
            Performance Optimization
          </Heading>
          <CodeBlock language="typescript" title="Batch Operations with Transactions">
            {`// Batch operations for better performance
const batchUpdateUsers = function(value: UserState, updates: UserUpdate[]) {
  return this.transact({
    suspendValidation: true, // Skip validation for each individual update
    action() {
      // Process all updates in a single transaction
      for (const update of updates) {
        const user = this.value.users[update.userId];
        if (!user) {
          throw new Error(\`User \${update.userId} not found\`);
        }
        
        // Apply update
        this.mutate(draft => {
          Object.assign(draft.users[update.userId], update.changes);
        });
      }
      
      // Update metadata
      this.mutate(draft => {
        draft.lastBatchUpdate = new Date();
        draft.batchUpdateCount = (draft.batchUpdateCount || 0) + 1;
      });
      
      // Validation runs once at the end for all changes
    }
  });
};

// Bulk data import with progress tracking
const importData = function(value: ImportState, data: ImportData[]) {
  return this.transact({
    suspendValidation: true,
    action() {
      const total = data.length;
      let processed = 0;
      
      for (const item of data) {
        try {
          // Process individual item
          this.$.processImportItem(item);
          processed++;
          
          // Update progress (but don't trigger validation yet)
          this.set('importProgress', {
            processed,
            total,
            percentage: Math.round((processed / total) * 100)
          });
          
        } catch (error) {
          // Add to error list but continue processing
          this.mutate(draft => {
            if (!draft.importErrors) draft.importErrors = [];
            draft.importErrors.push({
              item: item.id,
              error: error.message
            });
          });
        }
      }
      
      // Final validation and cleanup
      this.set('importStatus', 'completed');
      this.set('importCompletedAt', new Date());
    }
  });
};`}
          </CodeBlock>
        </Box>

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
