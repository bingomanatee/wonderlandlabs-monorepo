// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/validation-patterns.ts
// Description: Validation patterns and test function examples
// Last synced: Mon Sep 22 17:07:24 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Use arrays of test functions for clean validation
tests: [
  (value) => (value.age < 0 ? 'Age cannot be negative' : null),
  (value) => (value.age > 150 ? 'Age seems unrealistic' : null),
  (value) => (!value.email.includes('@') ? 'Invalid email format' : null),
  (value) => (value.name.length === 0 ? 'Name cannot be empty' : null),
];
