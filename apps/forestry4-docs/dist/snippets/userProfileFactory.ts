// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/userProfileFactory.ts
// Description: User profile store factory
// Last synced: Mon Sep 15 14:19:16 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';

export interface UserState {
  name: string;
  age: number;
  email: string;
}

export default function userProfileFactory() {
  return new Forest<UserState>({
    name: 'user-store',
    value: {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    },
    actions: {
      // Tactical form handler using event target name
      onChange: function (
        this: Forest<UserState>,
        value: UserState,
        event: React.ChangeEvent<HTMLInputElement>
      ) {
        const { name, value: fieldValue, type } = event.target;
        const processedValue = type === 'number' ? parseInt(fieldValue) || 0 : fieldValue;
        this.set(name, processedValue);
      },
      setName: function (this: Forest<UserState>, value: UserState, name: string) {
        this.set('name', name);
      },
      setAge: function (this: Forest<UserState>, value: UserState, age: number) {
        this.set('age', age);
      },
      setEmail: function (this: Forest<UserState>, value: UserState, email: string) {
        this.set('email', email);
      },
      updateProfile: function (
        this: Forest<UserState>,
        value: UserState,
        profile: Partial<UserState>
      ) {
        this.next({ ...value, ...profile });
      },
      reset: function (this: Forest<UserState>) {
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
