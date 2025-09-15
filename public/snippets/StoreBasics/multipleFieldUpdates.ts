// Use next() for multiple field updates
actions: {
  updateProfile: function(value, updates: Partial<UserState>) {
    this.next({ ...value, ...updates });  // Merge multiple fields
  },
  reset: function() {
    this.next({  // Replace entire value
      name: 'John Doe',
      age: 30,
      email: 'john@example.com'
    });
  }
}
