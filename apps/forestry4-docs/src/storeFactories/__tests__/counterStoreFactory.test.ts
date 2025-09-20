import { describe, it, expect, beforeEach } from 'vitest';
import counterForestFactory, { CounterForest, type CounterState } from '../counterStoreFactory';

describe('Counter Store Factory (Modern 4.1.x)', () => {
  let counterStore: CounterForest;

  beforeEach(() => {
    counterStore = counterForestFactory();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(counterStore.value).toEqual({
        count: 0,
        history: [],
        multiplier: 1,
        qualityMessage: ''
      });
    });

    it('should have correct name', () => {
      expect(counterStore.$name).toContain('actions-demo');
    });
  });

  describe('$ Binding Functionality', () => {
    it('should have all methods available via $ binding', () => {
      expect(typeof counterStore.$.increment).toBe('function');
      expect(typeof counterStore.$.decrement).toBe('function');
      expect(typeof counterStore.$.setMultiplier).toBe('function');
      expect(typeof counterStore.$.doubleAndLog).toBe('function');
      expect(typeof counterStore.$.incrementTwice).toBe('function');
      expect(typeof counterStore.$.reset).toBe('function');
      expect(typeof counterStore.$.clearHistory).toBe('function');
    });

    it('should exclude $ prefixed methods from $ binding', () => {
      // Internal methods should not be in $ binding
      expect(counterStore.$.$branch).toBeUndefined();
      expect(counterStore.$.$parent).toBeUndefined();
    });
  });

  describe('Basic Actions', () => {
    it('should increment count by multiplier', () => {
      counterStore.$.increment();
      
      expect(counterStore.value.count).toBe(1);
      expect(counterStore.value.history).toContain('Incremented to 1');
    });

    it('should decrement count by multiplier', () => {
      counterStore.$.decrement();
      
      expect(counterStore.value.count).toBe(-1);
      expect(counterStore.value.history).toContain('Decremented to -1');
    });

    it('should respect multiplier in increment/decrement', () => {
      counterStore.$.setMultiplier(5);
      counterStore.$.increment();
      
      expect(counterStore.value.count).toBe(5);
      expect(counterStore.value.history).toContain('Incremented to 5');
      
      counterStore.$.decrement();
      expect(counterStore.value.count).toBe(0);
      expect(counterStore.value.history).toContain('Decremented to 0');
    });
  });

  describe('Complex Actions', () => {
    it('should double and log correctly', () => {
      counterStore.$.setMultiplier(3);
      counterStore.$.increment(); // count = 3
      counterStore.$.doubleAndLog(); // count = 6
      
      expect(counterStore.value.count).toBe(6);
      expect(counterStore.value.history).toContain('Doubled from 3 to 6');
    });

    it('should increment twice using $ binding', () => {
      counterStore.$.setMultiplier(2);
      counterStore.$.incrementTwice();
      
      expect(counterStore.value.count).toBe(4); // 2 * 2 = 4
      expect(counterStore.value.history).toHaveLength(2);
      expect(counterStore.value.history).toContain('Incremented to 2');
      expect(counterStore.value.history).toContain('Incremented to 4');
    });

    it('should reset state correctly', () => {
      counterStore.$.increment();
      counterStore.$.increment();
      counterStore.$.setMultiplier(5);
      
      counterStore.$.reset();
      
      expect(counterStore.value).toEqual({
        count: 0,
        history: ['Reset to 0'],
        multiplier: 1,
        qualityMessage: ''
      });
    });

    it('should clear history', () => {
      counterStore.$.increment();
      counterStore.$.decrement();
      expect(counterStore.value.history).toHaveLength(2);
      
      counterStore.$.clearHistory();
      expect(counterStore.value.history).toHaveLength(0);
    });
  });

  describe('Prep Function (Quality Messages)', () => {
    it('should show quality message for very low count', () => {
      // Set count to below -100
      counterStore.set('count', -150);
      
      expect(counterStore.value.qualityMessage).toBe('Count is getting very low');
    });

    it('should show quality message for very high count', () => {
      // Set count to above 100
      counterStore.set('count', 150);
      
      expect(counterStore.value.qualityMessage).toBe('Count is getting very high');
    });

    it('should show quality message for low multiplier', () => {
      counterStore.$.setMultiplier(0);
      
      expect(counterStore.value.qualityMessage).toBe('Multiplier works best at 1 or higher');
    });

    it('should clear quality message when values are normal', () => {
      // First set a problematic value
      counterStore.set('count', 150);
      expect(counterStore.value.qualityMessage).toBe('Count is getting very high');
      
      // Then set a normal value
      counterStore.set('count', 50);
      expect(counterStore.value.qualityMessage).toBe('');
    });
  });

  describe('State Management', () => {
    it('should maintain state consistency across multiple operations', () => {
      counterStore.$.setMultiplier(3);
      counterStore.$.increment(); // count = 3
      counterStore.$.doubleAndLog(); // count = 6
      counterStore.$.decrement(); // count = 3
      
      expect(counterStore.value.count).toBe(3);
      expect(counterStore.value.multiplier).toBe(3);
      expect(counterStore.value.history).toHaveLength(3);
      expect(counterStore.value.history[0]).toBe('Incremented to 3');
      expect(counterStore.value.history[1]).toBe('Doubled from 3 to 6');
      expect(counterStore.value.history[2]).toBe('Decremented to 3');
    });

    it('should handle edge cases gracefully', () => {
      // Test with zero multiplier (should still work but show quality message)
      counterStore.$.setMultiplier(0);
      counterStore.$.increment();
      
      expect(counterStore.value.count).toBe(0); // 0 + 0 = 0
      expect(counterStore.value.qualityMessage).toBe('Multiplier works best at 1 or higher');
    });
  });

  describe('Method Context and Binding', () => {
    it('should maintain proper this context in bound methods', () => {
      const boundIncrement = counterStore.$.increment;
      
      // Should work even when called as standalone function
      boundIncrement();
      
      expect(counterStore.value.count).toBe(1);
      expect(counterStore.value.history).toContain('Incremented to 1');
    });

    it('should allow method chaining through $ binding', () => {
      // incrementTwice calls this.$.increment() twice
      counterStore.$.incrementTwice();
      
      expect(counterStore.value.count).toBe(2);
      expect(counterStore.value.history).toHaveLength(2);
    });
  });

  describe('Schema Validation', () => {
    it('should validate state structure with Zod schema', () => {
      // The schema should enforce the correct structure
      expect(() => {
        counterStore.next({
          count: 10,
          history: ['test'],
          multiplier: 2,
          qualityMessage: 'test message'
        });
      }).not.toThrow();
    });

    it('should reject invalid state structure', () => {
      expect(() => {
        // @ts-expect-error - Testing runtime validation
        counterStore.next({
          count: 'invalid', // Should be number
          history: ['test'],
          multiplier: 2,
          qualityMessage: 'test'
        });
      }).toThrow();
    });
  });
});
