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
