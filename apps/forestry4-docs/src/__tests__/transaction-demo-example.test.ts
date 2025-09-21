import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { transactionDemoStoreFactory, TransactionDemoForest } from '../storeFactories/transactionDemoStoreFactory';

describe('Transaction Demo Store', () => {
  let store: TransactionDemoForest;

  beforeEach(() => {
    store = transactionDemoStoreFactory();
  });

  afterEach(() => {
    store.complete();
  });

  describe('initial state', () => {
    it('should have correct initial bank accounts', () => {
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankAccounts.savings.balance).toBe(5000);
      expect(store.value.bankTransactions).toEqual([]);
    });

    it('should have correct initial inventory', () => {
      expect(store.value.inventory.laptop).toBe(5);
      expect(store.value.inventory.mouse).toBe(20);
      expect(store.value.inventory.keyboard).toBe(15);
    });

    it('should have correct initial order state', () => {
      expect(store.value.orders).toEqual({});
      expect(store.value.paymentStatus).toBe('pending');
    });

    it('should have correct initial migration state', () => {
      expect(store.value.migrationStatus).toBe('idle');
      expect(store.value.migrationProgress).toBe(0);
      expect(store.value.isProcessing).toBe(false);
    });
  });

  describe('bank transfers', () => {
    it('should transfer funds between accounts successfully', () => {
      store.transferFunds('checking', 'savings', 200);

      expect(store.value.bankAccounts.checking.balance).toBe(800);
      expect(store.value.bankAccounts.savings.balance).toBe(5200);
      expect(store.value.bankTransactions).toHaveLength(1);
      expect(store.value.bankTransactions[0].amount).toBe(200);
      expect(store.value.bankTransactions[0].description).toContain('Transfer from Checking Account to Savings Account');
    });

    it('should fail transfer with insufficient funds', () => {
      expect(() => {
        store.transferFunds('checking', 'savings', 1500);
      }).toThrow('Insufficient funds');

      // State should remain unchanged after failed transaction
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankAccounts.savings.balance).toBe(5000);
      expect(store.value.bankTransactions).toHaveLength(0);
    });

    it('should fail transfer with invalid account', () => {
      expect(() => {
        store.transferFunds('checking', 'invalid', 100);
      }).toThrow('Invalid account');

      // State should remain unchanged
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankTransactions).toHaveLength(0);
    });

    it('should fail transfer to same account', () => {
      expect(() => {
        store.transferFunds('checking', 'checking', 100);
      }).toThrow('Cannot transfer to the same account');

      // State should remain unchanged
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankTransactions).toHaveLength(0);
    });

    it('should fail transfer with zero amount', () => {
      expect(() => {
        store.transferFunds('checking', 'savings', 0);
      }).toThrow('Transfer amount must be greater than 0');

      // State should remain unchanged
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankTransactions).toHaveLength(0);
    });

    it('should fail transfer with negative amount', () => {
      expect(() => {
        store.transferFunds('checking', 'savings', -100);
      }).toThrow('Transfer amount must be greater than 0');

      // State should remain unchanged
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankTransactions).toHaveLength(0);
    });
  });

  describe('order processing', () => {
    it('should process order successfully', () => {
      const order = {
        items: [
          { productId: 'laptop', name: 'Gaming Laptop', quantity: 1, price: 1200 },
          { productId: 'mouse', name: 'Wireless Mouse', quantity: 2, price: 50 },
        ],
        totalAmount: 1300,
      };

      store.processOrder(order);

      // Check inventory was updated
      expect(store.value.inventory.laptop).toBe(4);
      expect(store.value.inventory.mouse).toBe(18);

      // Check order was created
      const orderIds = Object.keys(store.value.orders);
      expect(orderIds).toHaveLength(1);
      
      const createdOrder = store.value.orders[orderIds[0]];
      expect(createdOrder.status).toBe('confirmed');
      expect(createdOrder.items).toHaveLength(2);
      expect(createdOrder.totalAmount).toBe(1300);

      // Check payment status
      expect(store.value.paymentStatus).toBe('completed');
    });

    it('should fail order processing with insufficient inventory', () => {
      const order = {
        items: [
          { productId: 'laptop', name: 'Gaming Laptop', quantity: 10, price: 1200 }, // Only 5 in stock
        ],
        totalAmount: 12000,
      };

      expect(() => {
        store.processOrder(order);
      }).toThrow('Insufficient inventory for Gaming Laptop');

      // State should remain unchanged after failed transaction
      expect(store.value.inventory.laptop).toBe(5);
      expect(Object.keys(store.value.orders)).toHaveLength(0);
      expect(store.value.paymentStatus).toBe('pending');
    });
  });

  describe('data migration', () => {
    it('should complete migration successfully', () => {
      const migrationPlan = {
        steps: ['step1', 'step2', 'step3'],
        dataSize: 1000,
      };

      store.migrateData(migrationPlan);

      expect(store.value.migrationStatus).toBe('completed');
      expect(store.value.migrationProgress).toBe(100);
      expect(store.value.migrationError).toBeUndefined();
    });

    it('should handle migration failure and rollback', () => {
      const migrationPlan = {
        steps: ['step1', 'critical_step_that_fails', 'step3'],
        dataSize: 1000,
      };

      // Mock Math.random to ensure failure
      const originalRandom = Math.random;
      Math.random = () => 0.1; // Will trigger failure for critical steps

      expect(() => {
        store.migrateData(migrationPlan);
      }).toThrow('Critical step failed');

      expect(store.value.migrationStatus).toBe('failed');
      expect(store.value.migrationError).toContain('Critical step failed');

      // Restore Math.random
      Math.random = originalRandom;
    });
  });

  describe('batch operations', () => {
    it('should update inventory in batch', () => {
      const updates = [
        { productId: 'laptop', quantity: 10 },
        { productId: 'mouse', quantity: 25 },
        { productId: 'keyboard', quantity: 30 },
      ];

      store.batchUpdateInventory(updates);

      expect(store.value.inventory.laptop).toBe(10);
      expect(store.value.inventory.mouse).toBe(25);
      expect(store.value.inventory.keyboard).toBe(30);
    });

    it('should fail batch update with invalid quantity', () => {
      const updates = [
        { productId: 'laptop', quantity: 10 },
        { productId: 'mouse', quantity: -5 }, // Invalid negative quantity
      ];

      expect(() => {
        store.batchUpdateInventory(updates);
      }).toThrow('Invalid quantity for mouse');

      // State should remain unchanged after failed transaction
      expect(store.value.inventory.laptop).toBe(5);
      expect(store.value.inventory.mouse).toBe(20);
    });
  });

  describe('transaction rollback', () => {
    it('should rollback all changes when transaction fails', () => {
      const initialState = { ...store.value };

      // Attempt a transfer that will fail
      expect(() => {
        store.transferFunds('checking', 'savings', 2000); // More than available
      }).toThrow('Insufficient funds');

      // State should be exactly the same as before
      expect(store.value.bankAccounts.checking.balance).toBe(initialState.bankAccounts.checking.balance);
      expect(store.value.bankAccounts.savings.balance).toBe(initialState.bankAccounts.savings.balance);
      expect(store.value.bankTransactions).toEqual(initialState.bankTransactions);
    });
  });

  describe('reset functionality', () => {
    it('should reset all state to initial values', () => {
      // Make some changes
      store.transferFunds('checking', 'savings', 200);
      store.batchUpdateInventory([{ productId: 'laptop', quantity: 10 }]);

      // Verify changes were made
      expect(store.value.bankAccounts.checking.balance).toBe(800);
      expect(store.value.inventory.laptop).toBe(10);

      // Reset
      store.reset();

      // Verify reset to initial state
      expect(store.value.bankAccounts.checking.balance).toBe(1000);
      expect(store.value.bankAccounts.savings.balance).toBe(5000);
      expect(store.value.bankTransactions).toEqual([]);
      expect(store.value.inventory.laptop).toBe(5);
      expect(store.value.inventory.mouse).toBe(20);
      expect(store.value.inventory.keyboard).toBe(15);
      expect(store.value.orders).toEqual({});
      expect(store.value.paymentStatus).toBe('pending');
      expect(store.value.migrationStatus).toBe('idle');
      expect(store.value.migrationProgress).toBe(0);
    });
  });

  describe('validation', () => {
    it('should enforce schema validation through prep function', () => {
      expect(() => {
        // Try to set negative balance directly (should be caught by prep)
        store.set('bankAccounts.checking.balance', -100);
      }).toThrow('Account balance cannot be negative');
    });
  });
});
