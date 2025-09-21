// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/counterStoreFactory.ts
// Description: Counter store factory example
// Last synced: Sat Sep 20 21:09:31 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Zod schema for runtime validation and type safety
const CounterStateSchema = z.object({
  count: z.number().int(),
  history: z.array(z.string()),
  multiplier: z.number().int().min(0), // Allow 0 for testing, prep function will provide quality feedback
  qualityMessage: z.string()
});

type CounterState = z.infer<typeof CounterStateSchema>;

// Modern Forestry 4.1.x class extension pattern
class CounterForest extends Forest<CounterState> {
  constructor() {
    super({
      name: 'actions-demo',
      value: { count: 0, history: [], multiplier: 1, qualityMessage: '' },
      schema: CounterStateSchema,
    });
  }

  // Basic state updates using mutate
  increment() {
    this.mutate((draft) => {
      const newCount = draft.count + draft.multiplier;
      draft.count = newCount;
      draft.history.push(`Incremented to ${newCount}`);
    });
  }

  decrement() {
    this.mutate((draft) => {
      const newCount = draft.count - draft.multiplier;
      draft.count = newCount;
      draft.history.push(`Decremented to ${newCount}`);
    });
  }

  // Single field updates
  setMultiplier(multiplier: number) {
    this.set('multiplier', multiplier);
  }

  // Complex state transformations using mutate
  doubleAndLog() {
    this.mutate((draft) => {
      const originalCount = draft.count;
      draft.count = originalCount * 2;
      draft.history.push(`Doubled from ${originalCount} to ${draft.count}`);
    });
  }

  // Nested actions calling other actions via $ binding
  incrementTwice() {
    this.$.increment();
    this.$.increment();
  }

  // Reset using next for complete state replacement
  reset() {
    this.next({ count: 0, history: ['Reset to 0'], multiplier: 1, qualityMessage: '' });
  }

  // Clear history using mutate to modify array
  clearHistory() {
    this.mutate((draft) => {
      draft.history.length = 0; // Clear array in place
    });
  }

  // Prep function for computed properties and validation
  prep(input: Partial<CounterState>, current: CounterState): CounterState {
    const result = { ...current, ...input };

    // Quality feedback for user input (not blocking validation)
    let qualityMessage = '';
    if (result.count < -100) {
      qualityMessage = 'Count is getting very low';
    } else if (result.count > 100) {
      qualityMessage = 'Count is getting very high';
    } else if (result.multiplier < 1) {
      qualityMessage = 'Multiplier works best at 1 or higher';
    }

    return { ...result, qualityMessage };
  }
}

// Factory function for useForestryLocal compatibility
export default function counterForestFactory() {
  return new CounterForest();
}

export type { CounterState };
export { CounterForest };
