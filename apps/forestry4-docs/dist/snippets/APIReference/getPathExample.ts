// Auto-generated snippet from: apps/forestry4-docs/src/examples/api-reference/getPathExample.ts
// Description: Forest get() method examples for retrieving values by path
// Last synced: Mon Sep 22 17:07:22 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

// Getting Values by Path
const userStore = new UserForest({
  name: 'John',
  profile: {
    age: 25,
    address: {
      city: 'New York',
      zip: '10001'
    }
  },
  hobbies: ['reading', 'coding', 'gaming']
});

// Get entire value
const fullValue = userStore.get(); // Returns complete state

// Get nested object
const profile = userStore.get('profile'); // Returns { age: 25, address: {...} }

// Get deeply nested value
const city = userStore.get('profile.address.city'); // Returns 'New York'

// Get array element
const firstHobby = userStore.get('hobbies.0'); // Returns 'reading'

// Get non-existent path returns undefined
const missing = userStore.get('profile.nonexistent'); // Returns undefined
