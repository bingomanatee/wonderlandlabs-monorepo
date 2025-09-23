import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import useForestryLocal from '../../hooks/useForestryLocal';

interface UserState {
  name: string;
  age: number;
  email: string;
}

// Modern Forestry 4.1.x class extension pattern
class UserStore extends Forest<UserState> {
  constructor() {
    super({
      name: 'user-store',
      value: {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      },
    });
  }

  setName(name: string) {
    this.mutate((draft) => {
      draft.name = name;
    });
  }

  setAge(age: number) {
    this.mutate((draft) => {
      draft.age = age;
    });
  }

  setEmail(email: string) {
    this.mutate((draft) => {
      draft.email = email;
    });
  }
}

const userStoreFactory = () => new UserStore();

const UserProfile: React.FC = () => {
  // useForestryLocal hook creates a local store instance
  const [userState, userStore] = useForestryLocal(userStoreFactory);

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {userState.name}</p>
      <p>Age: {userState.age}</p>
      <p>Email: {userState.email}</p>

      <button onClick={() => userStore.$.setName('Jane Doe')}>Change Name</button>
      <button onClick={() => userStore.$.setAge(25)}>Change Age</button>
    </div>
  );
};

export default UserProfile;
