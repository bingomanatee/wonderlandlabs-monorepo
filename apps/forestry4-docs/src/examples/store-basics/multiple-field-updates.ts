// Modern Forestry 4.1.x class methods for multiple field updates
updateProfile(updates: Partial<UserState>) {
  this.mutate(draft => {
    Object.assign(draft, updates);  // Merge multiple fields with Immer
  });
}

reset() {
  this.next({  // Replace entire value
    name: 'John Doe',
    age: 30,
    email: 'john@example.com'
  });
}
