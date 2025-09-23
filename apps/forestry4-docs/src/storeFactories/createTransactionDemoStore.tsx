import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Transaction state schema
const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  description: z.string(),
  timestamp: z.number(),
});

const BankStateSchema = z.object({
  balance: z.number().min(0, 'Account balance cannot be negative'),
  transactions: z.array(TransactionSchema),
  pendingOperations: z.number().min(0),
  isProcessing: z.boolean(),
});

type BankState = z.infer<typeof BankStateSchema>;
type Transaction = z.infer<typeof TransactionSchema>;

// Modern Forestry 4.1.x class extension pattern
class TransactionDemoForest extends Forest<BankState> {
  private handleError: (error: Error) => void;

  constructor(handleError?: (error: Error) => void) {
    if (!handleError) {
      throw new Error('handleError is required');
    }

    super({
      name: 'transaction-demo',
      value: {
        balance: 1000,
        transactions: [],
        pendingOperations: 0,
        isProcessing: false,
      },
      prep: (input: Partial<BankState>, current: BankState): BankState => {
        // Use Zod schema for validation in prep
        const result = BankStateSchema.safeParse({ ...current, ...input });
        if (!result.success) {
          throw new Error(`Invalid state: ${result.error.message}`);
        }
        return result.data;
      },
    });

    this.handleError = handleError;
  }

  // Basic transfer that can fail validation
  transfer(amount: number, description: string) {
    if (amount <= 0) {
      throw new Error('Transfer amount must be positive');
    }
    if (this.value.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const newBalance = this.value.balance - amount;
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount: -amount,
      description,
      timestamp: Date.now(),
    };

    this.mutate((draft) => {
      draft.balance = newBalance;
      draft.transactions.push(transaction);
    });
  }

  // Deposit money
  deposit(amount: number, description: string) {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      description,
      timestamp: Date.now(),
    };

    this.mutate((draft) => {
      draft.balance += amount;
      draft.transactions.push(transaction);
    });
  }

  // Complex multi-step operation using transactions
  processPayroll(employees: Array<{ name: string; salary: number }>) {
    this.$transact({
      suspendValidation: true,
      action: () => {
        // Track pending operations
        this.mutate((draft) => {
          draft.pendingOperations = employees.length;
        });

        let totalPayout = 0;
        const newTransactions: Transaction[] = [];

        // Process each employee
        for (const employee of employees) {
          if (employee.salary <= 0) {
            throw new Error(`Invalid salary for ${employee.name}`);
          }

          totalPayout += employee.salary;
          newTransactions.push({
            id: Math.random().toString(36).substr(2, 9),
            amount: -employee.salary,
            description: `Payroll: ${employee.name}`,
            timestamp: Date.now(),
          });
        }

        // Check if we have enough funds for entire payroll
        if (this.value.balance < totalPayout) {
          throw new Error(
            `Insufficient funds for payroll. Need $${totalPayout}, have $${this.value.balance}`
          );
        }

        // Apply all changes atomically
        this.mutate((draft) => {
          draft.balance -= totalPayout;
          draft.transactions.push(...newTransactions);
          draft.pendingOperations = 0;
        });
      },
    });
  }

  // Safe version that catches errors
  safeTransfer(amount: number, description: string) {
    try {
      this.transfer(amount, description);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  safeDeposit(amount: number, description: string) {
    try {
      this.deposit(amount, description);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  safeProcessPayroll(employees: Array<{ name: string; salary: number }>) {
    try {
      this.processPayroll(employees);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // Demo payroll action with processing state
  handlePayrollDemo() {
    this.set('isProcessing', true);

    const employees = [
      { name: 'Alice Johnson', salary: 300 },
      { name: 'Bob Smith', salary: 250 },
      { name: 'Carol Davis', salary: 400 },
    ];

    // Simulate processing delay
    setTimeout(() => {
      try {
        this.processPayroll(employees);
      } catch (error) {
        this.handleError(error as Error);
      } finally {
        this.set('isProcessing', false);
      }
    }, 1000);
  }

  // Failed payroll demo
  handleFailedPayroll() {
    const employees = [
      { name: 'Alice Johnson', salary: 500 },
      { name: 'Bob Smith', salary: 600 },
      { name: 'Carol Davis', salary: 700 },
    ];
    this.safeProcessPayroll(employees); // This will fail due to insufficient funds
  }

  // Complex transaction with nested operations
  transferWithFee(amount: number, description: string, feePercentage: number = 0.02) {
    this.$transact({
      suspendValidation: true,
      action: () => {
        const fee = Math.round(amount * feePercentage * 100) / 100;
        const totalAmount = amount + fee;

        if (this.value.balance < totalAmount) {
          throw new Error(
            `Insufficient funds. Need $${totalAmount} (including $${fee} fee), have $${this.value.balance}`
          );
        }

        // Step 1: Deduct main amount
        this.mutate((draft) => {
          draft.balance -= amount;
          draft.transactions.push({
            id: Math.random().toString(36).substr(2, 9),
            amount: -amount,
            description,
            timestamp: Date.now(),
          });
        });

        // Step 2: Deduct fee
        this.mutate((draft) => {
          draft.balance -= fee;
          draft.transactions.push({
            id: Math.random().toString(36).substr(2, 9),
            amount: -fee,
            description: `Transaction fee for: ${description}`,
            timestamp: Date.now(),
          });
        });
      },
    });
  }

  // Batch transfer operation
  batchTransfer(transfers: Array<{ amount: number; description: string }>) {
    this.$transact({
      suspendValidation: true,
      action: () => {
        const totalAmount = transfers.reduce((sum, t) => sum + t.amount, 0);

        if (this.value.balance < totalAmount) {
          throw new Error(
            `Insufficient funds for batch transfer. Need $${totalAmount}, have $${this.value.balance}`
          );
        }

        // Process all transfers atomically
        const newTransactions: Transaction[] = [];
        let runningBalance = this.value.balance;

        for (const transfer of transfers) {
          runningBalance -= transfer.amount;
          newTransactions.push({
            id: Math.random().toString(36).substr(2, 9),
            amount: -transfer.amount,
            description: transfer.description,
            timestamp: Date.now(),
          });
        }

        this.mutate((draft) => {
          draft.balance = runningBalance;
          draft.transactions.push(...newTransactions);
        });
      },
    });
  }

  // Reset to initial state
  reset() {
    this.mutate((draft) => {
      draft.balance = 1000;
      draft.transactions = [];
      draft.pendingOperations = 0;
      draft.isProcessing = false;
    });
  }
}

// Factory function for backward compatibility
export const createTransactionDemoStore = (handleError?: (error: Error) => void) => {
  return new TransactionDemoForest(handleError);
};

// Export the class for direct use
export { TransactionDemoForest };
export type { BankState, Transaction };
