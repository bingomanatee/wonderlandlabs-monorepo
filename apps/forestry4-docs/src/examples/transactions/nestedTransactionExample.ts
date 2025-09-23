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
