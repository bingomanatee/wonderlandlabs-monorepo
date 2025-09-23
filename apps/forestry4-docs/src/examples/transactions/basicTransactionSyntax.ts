// Basic transaction syntax
store.transact({
  action() {
    // All operations here are atomic
    this.$.updateBalance(100);
    this.$.addTransaction('deposit', 100);
    this.$.notifyUser('Transaction complete');
  }
});

// With validation suspension
store.transact({
  suspendValidation: true,
  action() {
    // Validation is suspended during execution
    this.next({ balance: -50 }); // Temporarily invalid
    this.$.processRefund(50);
    this.next({ balance: 0 }); // Final state is valid
  }
});
