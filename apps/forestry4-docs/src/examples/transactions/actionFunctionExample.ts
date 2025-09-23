// Simple action function
store.transact({
  action() {
    // Use this.$ to call other actions
    this.$.updateBalance(100);
    this.$.addTransaction('deposit');
  }
});

// Action with complex logic
store.transact({
  action() {
    const currentBalance = this.value.balance;
    
    if (currentBalance < 100) {
      this.$.addFee(5);
    }
    
    this.$.processTransfer(amount);
    this.$.updateTimestamp();
  }
});
