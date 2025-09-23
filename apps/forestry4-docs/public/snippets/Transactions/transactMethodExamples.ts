// Auto-generated snippet from: apps/forestry4-docs/src/examples/transactions/transactMethodExamples.ts
// Description: Transaction method examples with nested transactions and error handling
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Transaction Method Examples
const userStore = new UserForest({
  name: 'John',
  balance: 1000,
  transactions: []
});

// Basic transaction with action function
userStore.transact({
  action() {
    this.next({ 
      balance: this.value.balance - 100,
      transactions: [...this.value.transactions, {
        id: Date.now(),
        amount: -100,
        description: 'Purchase'
      }]
    });
  }
});

// Transaction with validation suspension
userStore.transact({
  suspendValidation: true,
  action() {
    // Temporarily allow invalid state
    this.next({ balance: -50 }); // Negative balance temporarily allowed
    this.$.processRefund(150);    // Final balance becomes positive
  }
});

// Nested transactions
userStore.transact({
  action() {
    // Outer transaction
    this.$.updateBalance(100);
    
    try {
      // Inner transaction that might fail
      this.transact({
        action() {
          this.$.riskyOperation();
        }
      });
    } catch (error) {
      // Handle inner transaction failure
      this.$.logError(error);
    }
    
    this.$.finalizeOperation();
  }
});

// Transaction with error handling
try {
  userStore.transact({
    action() {
      this.$.step1(); // Success
      this.$.step2(); // Success
      this.$.step3(); // Throws error - triggers rollback
    }
  });
} catch (error) {
  console.log('Transaction failed, state rolled back');
}
