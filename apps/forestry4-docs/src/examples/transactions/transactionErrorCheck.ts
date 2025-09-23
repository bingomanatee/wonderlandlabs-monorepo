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
