// Auto-generated snippet from: apps/forestry4-docs/src/examples/store-basics/react-integration.tsx
// Description: React integration example for live demo
// Last synced: Mon Sep 22 17:07:24 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import useForestryLocal from '../../hooks/useForestryLocal';
import userStoreFactory from './live-example-store-definition';

const UserProfileDemo: React.FC = () => {
  const [userState, store] = useForestryLocal(userStoreFactory);

  return (
    <div>
      <h2>User Profile</h2>
      <p>Name: {userState.name}</p>
      <p>Age: {userState.age}</p>
      <p>Email: {userState.email}</p>

      <button onClick={() => store.$.setName('Jane Doe')}>Update Name</button>
      <button onClick={() => store.$.setAge(25)}>Update Age</button>
      <button onClick={() => store.$.reset()}>Reset Profile</button>
    </div>
  );
};

export default UserProfileDemo;
