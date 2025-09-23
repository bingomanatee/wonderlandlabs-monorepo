// Automatic rollback on error
try {
  store.transact({
    action() {
      this.$.step1(); // ✅ Success
      this.$.step2(); // ✅ Success  
      this.$.step3(); // ❌ Throws error
      this.$.step4(); // Never executed
    }
  });
} catch (error) {
  // Store state is exactly as it was before the transaction
  console.log('Transaction failed:', error.message);
  console.log('State rolled back automatically');
}

// Handling specific errors
store.transact({
  action() {
    try {
      this.$.riskyOperation();
    } catch (error) {
      // Handle error within transaction
      this.$.logError(error);
      this.$.setErrorState(error.message);
      // Transaction continues - no rollback
    }
  }
});

// Conditional rollback
store.transact({
  action() {
    const result = this.$.attemptOperation();
    
    if (!result.success) {
      // Explicitly throw to trigger rollback
      throw new Error(`Operation failed: ${result.error}`);
    }
    
    this.$.finalizeOperation(result);
  }
});
