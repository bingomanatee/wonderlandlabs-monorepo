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
userStore.set('profile.age', 26);
console.log(userStore.get('profile.age')); // 26

// Set deeply nested value
userStore.set('profile.address.city', 'Boston');

// Set array element
userStore.set(['hobbies', 1], 'gaming');
console.log(userStore.get('hobbies')); // ['reading', 'gaming']

// Add new array element
userStore.set('hobbies.2', 'music');

// Set will create intermediate objects if needed
userStore.set('profile.social.twitter', '@john');

// filterPath can normalize caller-facing paths before set/get/mutate.
class FormForest extends Forest<{
  fields: Array<{ name: string; value: string }>;
}> {
  constructor() {
    super({
      value: {
        fields: [
          { name: 'email', value: '' },
          { name: 'displayName', value: '' },
        ],
      },
      filterPath(path, store) {
        const parts = Array.isArray(path) ? path : path.split('.');
        if (parts[0] !== 'fields' || parts.length < 3) {
          return path;
        }

        const fieldIndex = store.value.fields.findIndex(
          (field) => field.name === parts[1],
        );
        return fieldIndex < 0
          ? path
          : ['fields', fieldIndex, ...parts.slice(2)];
      },
    });
  }
}

const formStore = new FormForest();

formStore.set('fields.email.value', 'ada@example.com');
console.log(formStore.get(['fields', 0, 'value'])); // ada@example.com
console.log(formStore.get('fields.email.value')); // ada@example.com
