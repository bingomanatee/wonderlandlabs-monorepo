// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/transactionDemoStoreFactory.ts
// Description: Transaction demo store factory with bank, order, and migration examples
// Last synced: Sun Sep 21 14:32:35 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Transaction state schema
const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  timestamp: z.number(),
});

const BankAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  balance: z.number().min(0, 'Account balance cannot be negative'),
});

const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

const OrderSchema = z.object({
  id: z.string(),
  items: z.array(OrderItemSchema),
  status: z.enum(['pending', 'processing', 'confirmed', 'failed']),
  totalAmount: z.number().min(0),
  processedAt: z.date().optional(),
});

// Comprehensive transaction demo state
const TransactionDemoStateSchema = z.object({
  // Bank example
  bankAccounts: z.record(z.string(), BankAccountSchema),
  bankTransactions: z.array(TransactionSchema),
  
  // Order processing example
  orders: z.record(z.string(), OrderSchema),
  inventory: z.record(z.string(), z.number().min(0)),
  paymentStatus: z.enum(['pending', 'processing', 'completed', 'failed']),
  
  // Migration example
  migrationStatus: z.enum(['idle', 'running', 'completed', 'failed']),
  migrationProgress: z.number().min(0).max(100),
  migrationError: z.string().optional(),
  
  // General state
  isProcessing: z.boolean(),
  lastError: z.string().optional(),
});

type TransactionDemoState = z.infer<typeof TransactionDemoStateSchema>;
type Transaction = z.infer<typeof TransactionSchema>;
type BankAccount = z.infer<typeof BankAccountSchema>;
type Order = z.infer<typeof OrderSchema>;

// Modern Forestry 4.1.x class extension pattern
class TransactionDemoForest extends Forest<TransactionDemoState> {
  constructor() {
    super({
      name: 'transaction-demo-comprehensive',
      value: {
        // Bank example initial state
        bankAccounts: {
          checking: { id: 'checking', name: 'Checking Account', balance: 1000 },
          savings: { id: 'savings', name: 'Savings Account', balance: 5000 },
        },
        bankTransactions: [],
        
        // Order processing initial state
        orders: {},
        inventory: {
          laptop: 5,
          mouse: 20,
          keyboard: 15,
        },
        paymentStatus: 'pending',
        
        // Migration initial state
        migrationStatus: 'idle',
        migrationProgress: 0,
        
        // General state
        isProcessing: false,
      },
      prep: (input: Partial<TransactionDemoState>, current: TransactionDemoState): TransactionDemoState => {
        // Use Zod schema for validation in prep
        const result = TransactionDemoStateSchema.safeParse({ ...current, ...input });
        if (!result.success) {
          throw new Error(`Invalid state: ${result.error.message}`);
        }
        return result.data;
      },
    });
  }

  // Bank transfer with transaction
  transferFunds(fromAccountId: string, toAccountId: string, amount: number) {
    this.$transact({
      suspendValidation: true,
      action: () => {
        // Block same-account transfers
        if (fromAccountId === toAccountId) {
          throw new Error('Cannot transfer to the same account');
        }

        // Validate amount
        if (amount <= 0) {
          throw new Error('Transfer amount must be greater than 0');
        }

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
        const transaction: Transaction = {
          id: Date.now().toString(),
          amount,
          description: `Transfer from ${fromAccount.name} to ${toAccount.name}`,
          timestamp: Date.now(),
        };

        this.mutate(draft => {
          draft.bankTransactions.push(transaction);
        });
      },
    });
  }

  // Complex order processing with nested transactions
  processOrder(order: Omit<Order, 'id' | 'status' | 'processedAt'>) {
    this.$transact({
      suspendValidation: false,
      action: () => {
        const orderId = `order_${Date.now()}`;
        
        // Step 1: Validate inventory (inner transaction)
        this.$transact({
          suspendValidation: true,
          action: () => {
            for (const item of order.items) {
              const inventory = this.value.inventory[item.productId];
              if (inventory < item.quantity) {
                throw new Error(`Insufficient inventory for ${item.name}`);
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
            
            // Simulate payment processing
            const paymentResult = this.processPayment(order.totalAmount);
            if (!paymentResult.success) {
              throw new Error(`Payment failed: ${paymentResult.error}`);
            }
            this.set('paymentStatus', 'completed');
          },
        });

        // Step 3: Create order
        this.mutate(draft => {
          draft.orders[orderId] = {
            ...order,
            id: orderId,
            status: 'confirmed',
            processedAt: new Date(),
          };
        });
      },
    });
  }

  // Simulate payment processing
  private processPayment(amount: number): { success: boolean; error?: string } {
    if (amount <= 0) {
      return { success: false, error: 'Invalid payment amount' };
    }
    // Simulate random payment failure
    if (Math.random() < 0.1) {
      return { success: false, error: 'Payment gateway error' };
    }
    return { success: true };
  }

  // Data migration with transaction and progress tracking
  migrateData(migrationPlan: { steps: string[]; dataSize: number }) {
    try {
      this.$transact({
        suspendValidation: true,
        action: () => {
          this.set('migrationStatus', 'running');
          this.set('migrationProgress', 0);
          this.set('migrationError', undefined);

          const totalSteps = migrationPlan.steps.length;

          for (let i = 0; i < totalSteps; i++) {
            const step = migrationPlan.steps[i];

            // Simulate step processing
            this.processStep(step);

            // Update progress
            const progress = Math.round(((i + 1) / totalSteps) * 100);
            this.set('migrationProgress', progress);
          }

          this.set('migrationStatus', 'completed');
        },
      });
    } catch (error) {
      // Handle error outside transaction to persist error state
      this.set('migrationStatus', 'failed');
      this.set('migrationError', (error as Error).message);
      throw error;
    }
  }

  private processStep(step: string) {
    // Simulate step processing that might fail
    if (step.includes('critical') && Math.random() < 0.2) {
      throw new Error(`Critical step failed: ${step}`);
    }
  }

  // Batch operations with transaction
  batchUpdateInventory(updates: Array<{ productId: string; quantity: number }>) {
    this.$transact({
      suspendValidation: true,
      action: () => {
        for (const update of updates) {
          if (update.quantity < 0) {
            throw new Error(`Invalid quantity for ${update.productId}`);
          }
          
          this.mutate(draft => {
            draft.inventory[update.productId] = update.quantity;
          });
        }
      },
    });
  }

  // Reset all state
  reset() {
    this.mutate(draft => {
      draft.bankAccounts = {
        checking: { id: 'checking', name: 'Checking Account', balance: 1000 },
        savings: { id: 'savings', name: 'Savings Account', balance: 5000 },
      };
      draft.bankTransactions = [];
      draft.orders = {};
      draft.inventory = {
        laptop: 5,
        mouse: 20,
        keyboard: 15,
      };
      draft.paymentStatus = 'pending';
      draft.migrationStatus = 'idle';
      draft.migrationProgress = 0;
      draft.migrationError = undefined;
      draft.isProcessing = false;
      draft.lastError = undefined;
    });
  }
}

// Factory function
export const transactionDemoStoreFactory = () => new TransactionDemoForest();

// Export types and class
export { TransactionDemoForest };
export type { TransactionDemoState, Transaction, BankAccount, Order };
export default transactionDemoStoreFactory;
