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
