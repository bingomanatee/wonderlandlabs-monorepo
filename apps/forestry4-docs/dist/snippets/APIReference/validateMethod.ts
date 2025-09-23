// Auto-generated snippet from: apps/forestry4-docs/src/examples/api-reference/validateMethod.ts
// Description: Forest validate() method examples with schema and test validation
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Validation Examples
const userStore = new UserForest({
  name: 'John',
  age: 25,
  email: 'john@example.com'
}, {
  schema: z.object({
    name: z.string().min(1),
    age: z.number().min(0).max(150),
    email: z.string().email()
  }),
  
  tests: {
    validName: (value) => value.name.length > 0,
    adultAge: (value) => value.age >= 18
  }
});

// Validate current state
const currentValidity = userStore.validate(userStore.value);
console.log(currentValidity.isValid); // true
console.log(currentValidity.errors); // []

// Validate a potential new value
const testValue = { name: '', age: -5, email: 'invalid-email' };
const testValidity = userStore.validate(testValue);
console.log(testValidity.isValid); // false
console.log(testValidity.errors); // Array of validation errors

// Validation during transaction with suspendValidation
userStore.transact({
  suspendValidation: true,
  action() {
    // This validation will return isValid: true even for invalid values
    const validity = this.validate({ name: '', age: -1 });
    console.log(validity.isValid); // true (suspended)
  }
});
