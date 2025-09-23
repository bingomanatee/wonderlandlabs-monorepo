// Auto-generated snippet from: apps/forestry4-docs/src/examples/transactions/nestedTransactionExample.ts
// Description: Nested transaction example with error handling
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

store.transact({
  action() {
    try {
      // Inner transaction that might fail
      this.transact({
        action() {
          this.$.riskyOperation() // Might throw
        }
      })
    } catch (innerError) {
      // Handle inner transaction failure
      this.$.handleError(innerError)
      // Outer transaction continues
    }

    this.$.finalStep() // This still executes
  }
})
