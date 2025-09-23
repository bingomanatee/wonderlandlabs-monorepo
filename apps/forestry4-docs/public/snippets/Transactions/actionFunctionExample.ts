// Auto-generated snippet from: apps/forestry4-docs/src/examples/transactions/actionFunctionExample.ts
// Description: Transaction action function examples with complex logic
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Simple action function
store.transact({
  action() {
    // Use this.$ to call other actions
    this.$.updateBalance(100);
    this.$.addTransaction('deposit');
  }
});

// Action with complex logic
store.transact({
  action() {
    const currentBalance = this.value.balance;
    
    if (currentBalance < 100) {
      this.$.addFee(5);
    }
    
    this.$.processTransfer(amount);
    this.$.updateTimestamp();
  }
});
