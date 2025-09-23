// ❌ WRONG: Arrow functions cannot be bound to store instance
class UserStore extends Forest<UserState> {
  // This will NOT work - 'this' will not refer to the store
  updateName = (name: string) => {
    this.set('name', name); // 'this' is undefined or wrong context
  };
  
  // This will also NOT work
  validateEmail = (email: string) => {
    return this.value.email.includes('@'); // 'this.value' is undefined
  };
}

// ✅ CORRECT: Use regular function methods
class UserStore extends Forest<UserState> {
  // This works - 'this' is properly bound to the store instance
  updateName(name: string) {
    this.set('name', name); // 'this' refers to the store
  }
  
  // This also works
  validateEmail(email: string) {
    return this.value.email.includes('@'); // 'this.value' is the store's value
  }
}

// Why arrow functions don't work:
// - Arrow functions capture 'this' from their lexical scope
// - In class definitions, 'this' is not the instance during definition
// - Forestry needs to bind actions to the store instance at runtime
// - Only regular function methods can be properly bound
