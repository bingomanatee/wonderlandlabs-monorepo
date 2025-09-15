import { Store } from '@wonderlandlabs/forestry';

interface UserState {
  name: string;
  age: number;
  email: string;
}

const userStore = new Store<UserState>({
  name: 'user-store',
  value: {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
  },
  actions: {
    setName: function(value, name: string) {
      this.set('name', name);
    },
    setAge: function(value, age: number) {
      this.set('age', age);
    },
    setEmail: function(value, email: string) {
      this.set('email', email);
    },
  },
  tests: [
    (value: UserState) => value.age < 0 ? 'Age cannot be negative' : null,
    (value: UserState) => value.age > 150 ? 'Age seems unrealistic' : null,
    (value: UserState) => !value.email.includes('@') ? 'Invalid email format' : null,
    (value: UserState) => value.name.length === 0 ? 'Name cannot be empty' : null,
  ],
});

export default userStore;
