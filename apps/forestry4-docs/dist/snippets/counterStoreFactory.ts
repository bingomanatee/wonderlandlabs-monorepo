// Auto-generated snippet from: apps/forestry4-docs/src/storeFactories/counterStoreFactory.ts
// Description: Counter store factory example
// Last synced: Mon Sep 15 11:35:44 PDT 2025
// DO NOT EDIT - This file is automatically synced from the source

import { Forest } from '@wonderlandlabs/forestry4';
import { z } from 'zod';

// Zod schema for runtime validation and type safety
const CounterStateSchema = z.object({
  count: z.number().int(),
  history: z.array(z.string()),
  multiplier: z.number().int().min(1),
  qualityMessage: z.string()
});

type CounterState = z.infer<typeof CounterStateSchema>;

// Forest factory function - returns complete Forest instance
export default function counterForestFactory() {
  return new Forest<CounterState>({
    name: 'actions-demo',
    value: { count: 0, history: [], multiplier: 1, qualityMessage: '' },
    schema: CounterStateSchema,
    actions: {
      // Basic state updates using mutate
      increment: function() {
        this.mutate((draft) => {
          const newCount = draft.count + draft.multiplier;
          draft.count = newCount;
          draft.history.push(`Incremented to ${newCount}`);
        });
      },
      decrement: function() {
        this.mutate((draft) => {
          const newCount = draft.count - draft.multiplier;
          draft.count = newCount;
          draft.history.push(`Decremented to ${newCount}`);
        });
      },
      // Single field updates
      setMultiplier: function(value: CounterState, multiplier: number) {
        this.set('multiplier', multiplier);
      },
      // Complex state transformations using mutate
      doubleAndLog: function() {
        this.mutate((draft) => {
          const originalCount = draft.count;
          draft.count = originalCount * 2;
          draft.history.push(`Doubled from ${originalCount} to ${draft.count}`);
        });
      },
      // Nested actions calling other actions
      incrementTwice: function() {
        this.$.increment();
        this.$.increment();
      },
      // Reset using next for complete state replacement
      reset: function() {
        this.next({ count: 0, history: ['Reset to 0'], multiplier: 1, qualityMessage: '' });
      },
      // Clear history using mutate to modify array
      clearHistory: function() {
        this.mutate((draft) => {
          draft.history.length = 0; // Clear array in place
        });
      },
    },
    prep: function(input: Partial<CounterState>, current: CounterState): CounterState {
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
    },
    tests: [
      // Tests should only catch truly impossible states that indicate system bugs
      // User input validation belongs in prep
    ]
  });
}

export type { CounterState };
