// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/store-with-validation.ts
// Description: Store with validation using modern Forestry 4.1.x pattern
// Last synced: Mon Sep 22 17:07:23 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

interface UserState {
  name: string;
  age: number;
  email: string;
}

// Modern Forestry 4.1.x class extension pattern with validation
class UserStore extends Forest<UserState> {
  constructor() {
    super({
      name: 'user-store',
      value: {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      },
      tests: [
        (value: UserState) => (value.age < 0 ? 'Age cannot be negative' : null),
        (value: UserState) => (value.age > 150 ? 'Age seems unrealistic' : null),
        (value: UserState) => (!value.email.includes('@') ? 'Invalid email format' : null),
        (value: UserState) => (value.name.length === 0 ? 'Name cannot be empty' : null),
      ],
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

const userStore = new UserStore();
export default userStore;
