import { Forest } from '../Stores/Forest';
import { z } from 'zod';

/**
 * Example of a custom Forest subclass for a counter
 */
export class CounterForest extends Forest<number> {
  constructor(initialValue: number = 0) {
    super({
      value: initialValue,
      schema: z.number(),
      name: 'counter'
    });
  }

  increment() {
    this.next(this.value + 1);
  }

  decrement() {
    this.next(this.value - 1);
  }

  add(amount: number) {
    if (typeof amount !== 'number') {
      throw new Error('Amount must be a number');
    }
    this.next(this.value + amount);
  }

  reset() {
    this.next(0);
  }

  isPositive(): boolean {
    return this.value > 0;
  }

  isNegative(): boolean {
    return this.value < 0;
  }
}
