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
