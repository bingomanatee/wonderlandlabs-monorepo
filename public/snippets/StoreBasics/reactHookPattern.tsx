import React from 'react';
import { Store } from '@wonderlandlabs/forestry';
import useForestryLocal from '../hooks/useForestryLocal';

interface UserState {
  name: string;
  age: number;
  email: string;
}

const userStoreFactory = () => new Store<UserState>({
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

const UserProfile: React.FC = () => {
  // useForestryLocal hook creates a local store instance
  const [userState, userStore] = useForestryLocal(userStoreFactory);

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {userState.name}</p>
      <p>Age: {userState.age}</p>
      <p>Email: {userState.email}</p>
      
      <button onClick={() => userStore.$.setName('Jane Doe')}>
        Change Name
      </button>
      <button onClick={() => userStore.$.setAge(25)}>
        Change Age
      </button>
    </div>
  );
};

export default UserProfile;
