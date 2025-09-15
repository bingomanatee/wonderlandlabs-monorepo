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
});

export default userStore;
