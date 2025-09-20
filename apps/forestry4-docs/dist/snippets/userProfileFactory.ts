// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/userProfileFactory.ts
// Description: User profile store factory
// Last synced: Sat Sep 20 11:39:50 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

export interface UserState {
  name: string;
  age: number;
  email: string;
}
import { z } from 'zod';

const User = z.object({
  name: z.string(),
  age: z.number,
  email: z.email(),
});

export default function userProfileFactory() {
  return new Forest<UserState>({
    name: 'user-store',
    value: {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    },
    schema: User,
    actions: {
      // Tactical form handler using event target name
      onChange(value: UserState, event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value: fieldValue, type } = event.target;
        const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
        this.set(name, processedValue);
      },
      setName(value: UserState, name: string) {
        this.set('name', name);
      },
      setAge(value: UserState, age: number) {
        this.set('age', age);
      },
      setEmail(value: UserState, email: string) {
        this.set('email', email);
      },
      updateProfile: function (
        this: Forest<UserState>,
        value: UserState,
        profile: Partial<UserState>
      ) {
        this.next({ ...value, ...profile });
      },
      reset: function () {
        this.next({
          name: 'John Doe',
          age: 30,
          email: 'john@example.com',
        });
      },
    },
    tests: [
      (value: UserState) => (value.age < 0 ? 'Age cannot be negative' : null),
      (value: UserState) => (value.age > 150 ? 'Age seems unrealistic' : null),
      (value: UserState) => (!value.email.includes('@') ? 'Invalid email format' : null),
      (value: UserState) => (value.name.length === 0 ? 'Name cannot be empty' : null),
    ],
  });
}
