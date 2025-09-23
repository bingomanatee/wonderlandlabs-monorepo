// Auto-generated snippet from: apps/forestry4-docs/src/examples/transactions/transactionDebugging.ts
// Description: Transaction debugging with stack observation
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Enable transaction debugging
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
debugSub.unsubscribe()
