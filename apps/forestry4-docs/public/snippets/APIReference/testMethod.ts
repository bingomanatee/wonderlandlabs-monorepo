// Auto-generated snippet from: apps/forestry4-docs/src/examples/api-reference/testMethod.ts
// Description: Forest test() method examples ignoring transaction suspension
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Test Function Examples
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

// Test always validates regardless of transaction state
const testValue = { name: '', age: -5, email: 'invalid-email' };
const testResult = userStore.test(testValue);
console.log(testResult.isValid); // false
console.log(testResult.errors); // Array of validation errors

// Even during suspended validation, test() still validates
userStore.transact({
  suspendValidation: true,
  action() {
    // validate() returns isValid: true (suspended)
    const validateResult = this.validate({ name: '', age: -1 });
    console.log('validate():', validateResult.isValid); // true
    
    // test() ignores suspension and validates normally
    const testResult = this.test({ name: '', age: -1 });
    console.log('test():', testResult.isValid); // false
  }
});
