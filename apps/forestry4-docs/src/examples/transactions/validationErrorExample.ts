store.transact({
  suspendValidation: true,
  action() {
    // These intermediate states can be invalid
    this.next({ balance: -100 }) // Temporarily negative
    this.next({ balance: 50 })   // Still negative

    // But final state must be valid
    this.next({ balance: 200 })  // ✅ Valid final state
  }
})
