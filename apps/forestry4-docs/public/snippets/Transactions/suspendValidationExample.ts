// Auto-generated snippet from: apps/forestry4-docs/src/examples/transactions/suspendValidationExample.ts
// Description: Examples showing validation suspension during transactions
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Without suspendValidation - fails immediately
store.transact({
  action() {
    this.next({ balance: -100 }); // ❌ Fails here - negative balance
    this.$.processRefund(100);
  }
});

// With suspendValidation - allows temporary invalid states
store.transact({
  suspendValidation: true,
  action() {
    this.next({ balance: -100 }); // ✅ Temporarily allowed
    this.$.processRefund(100);     // ✅ Final balance: 0 (valid)
  }
});
