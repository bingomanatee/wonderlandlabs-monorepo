import { Forest } from '@wonderlandlabs/forestry4';

// Demo store for transaction examples
export const createTransactionDemoStore = (handleError?: (error: Error) => void) => {
  if (!handleError) {
    throw new Error('handleError absent');
  }
  return new Forest({
    value: {
      balance: 1000,
      transactions: [] as Array<{
        id: string;
        amount: number;
        description: string;
        timestamp: number;
      }>,
      pendingOperations: 0,
      isProcessing: false,
    },
    res: new Map([['handleError', handleError]]),
    actions: {
      // Basic transfer that can fail validation
      transfer(value, amount: number, description: string) {
        if (amount <= 0) {
          throw new Error('Transfer amount must be positive');
        }
        if (value.balance < amount) {
          throw new Error('Insufficient funds');
        }

        const newBalance = value.balance - amount;
        const transaction = {
          id: Math.random().toString(36).substr(2, 9),
          amount: -amount,
          description,
          timestamp: Date.now(),
        };

        this.next({
          ...value,
          balance: newBalance,
          transactions: [...value.transactions, transaction],
        });
      },

      // Deposit money
      deposit(value, amount: number, description: string) {
        if (amount <= 0) {
          throw new Error('Deposit amount must be positive');
        }

        const transaction = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          description,
          timestamp: Date.now(),
        };

        this.next({
          ...value,
          balance: value.balance + amount,
          transactions: [...value.transactions, transaction],
        });
      },

      // Complex multi-step operation using transactions
      processPayroll(value, employees: Array<{ name: string; salary: number }>) {
        this.transact({
          suspendValidation: true,
          action() {
            // Track pending operations
            this.next({
              ...this.value,
              pendingOperations: employees.length,
            });

            let totalPayout = 0;
            const newTransactions = [];

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
            this.next({
              balance: this.value.balance - totalPayout,
              transactions: [...this.value.transactions, ...newTransactions],
              pendingOperations: 0,
            });
          },
        });
      },

      // Safe version that catches errors

      safeTransfer(value, amount: number, description: string) {
        try {
          this.$.transfer(amount, description);
        } catch (error) {
          this.res.get('handleError')(error as Error);
        }
      },

      safeDeposit(_, amount: number, description: string) {
        try {
          this.$.deposit(amount, description);
        } catch (error) {
          this.res.get('handleError')(error as Error);
        }
      },

      safeProcessPayroll(value, employees: Array<{ name: string; salary: number }>) {
        try {
          this.$.processPayroll(employees);
        } catch (error) {
          this.res.get('handleError')(error as Error);
        }
      },

      // Demo payroll action with processing state
      handlePayrollDemo(value) {
        this.next({ ...value, isProcessing: true });

        const employees = [
          { name: 'Alice Johnson', salary: 300 },
          { name: 'Bob Smith', salary: 250 },
          { name: 'Carol Davis', salary: 400 },
        ];

        // Simulate processing delay
        setTimeout(() => {
          try {
            this.$.processPayroll(employees);
          } catch (error) {
            this.res.get('handleError')(error as Error);
          } finally {
            this.set('isProcessing', false);
          }
        }, 1000);
      },

      // Failed payroll demo
      handleFailedPayroll() {
        const employees = [
          { name: 'Alice Johnson', salary: 500 },
          { name: 'Bob Smith', salary: 600 },
          { name: 'Carol Davis', salary: 700 },
        ];
        this.$.safeProcessPayroll(employees); // This will fail due to insufficient funds
      },
    },

    reset() {
      this.next({
        balance: 1000,
        transactions: [],
        pendingOperations: 0,
        isProcessing: false,
      });
    },

    tests(value) {
      if (value.balance < 0) {
        return 'Account balance cannot be negative';
      }
      return null;
    },
  });
};
