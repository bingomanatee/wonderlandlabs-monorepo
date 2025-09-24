// Setting Values by Path
const userStore = new UserForest({
  name: 'John',
  profile: {
    age: 25,
    address: {
      city: 'New York',
      zip: '10001',
    },
  },
  hobbies: ['reading', 'coding'],
});

// Set nested value
const success1 = userStore.set('profile.age', 26); // Returns true
console.log(userStore.get('profile.age')); // 26

// Set deeply nested value
const success2 = userStore.set('profile.address.city', 'Boston'); // Returns true

// Set array element
const success3 = userStore.set(['hobbies', 1], 'gaming'); // Returns true

// Add new array element
const success4 = userStore.set('hobbies.2', 'music'); // Returns true

// Set will create intermediate objects if needed
const success5 = userStore.set('profile.social.twitter', '@john'); // Returns true
