// Auto-generated snippet from: apps/forestry4-docs/src/examples/transactions/transactionErrorCheck.ts
// Description: Transaction error checking and rollback verification
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Check transaction errors
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
}
