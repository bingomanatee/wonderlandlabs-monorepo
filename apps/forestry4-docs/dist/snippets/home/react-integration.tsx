// Auto-generated snippet from: apps/forestry4-docs/src/examples/home/react-integration.tsx
// Description: React integration example for Forestry 4
// Last synced: Mon Sep 22 17:07:21 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import React from 'react';
import { Forest } from '@wonderlandlabs/forestry4';
import useForestryLocal from '../../hooks/useForestryLocal';
import { CounterForest, CounterValue } from './basic-usage';
const counterForestFactory = () => new CounterForest();

const Counter: React.FC = () => {
  const [value, forest] = useForestryLocal<CounterValue>(counterForestFactory);
  const { count } = value;

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={forest.$.increment}>+</button>
      <button onClick={forest.$.decrement}>-</button>
    </div>
  );
};
