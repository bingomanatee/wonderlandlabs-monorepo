import { describe, it, expect, vi } from 'vitest';
import { Forest } from '../Forest';
import { Store } from '../Store';

// Test to confirm the enumeration issue
describe('Method Enumeration Debug', () => {
  it('should show the difference between Object.keys and other enumeration methods', () => {
    class TestStore extends Forest<{ count: number }> {
      constructor() {
        super({ value: { count: 0 } });
      }

      increment() {
        this.mutate(draft => {
          draft.count += 1;
        });
      }

      decrement() {
        this.mutate(draft => {
          draft.count -= 1;
        });
      }
    }

    const store = new TestStore();

    console.log('=== Method Enumeration Debug ===');
    console.log('Object.keys(store):', Object.keys(store));
    console.log('Object.getOwnPropertyNames(store):', Object.getOwnPropertyNames(store));

    // Check prototype chain
    console.log('Object.keys(Object.getPrototypeOf(store)):', Object.keys(Object.getPrototypeOf(store)));
    console.log('Object.getOwnPropertyNames(Object.getPrototypeOf(store)):', Object.getOwnPropertyNames(Object.getPrototypeOf(store)));

    // Check if methods exist
    console.log('store.increment exists:', typeof store.increment);
    console.log('store.decrement exists:', typeof store.decrement);

    // Check property descriptors
    const proto = Object.getPrototypeOf(store);
    console.log('increment descriptor:', Object.getOwnPropertyDescriptor(proto, 'increment'));
    console.log('decrement descriptor:', Object.getOwnPropertyDescriptor(proto, 'decrement'));

    // This test will help us understand the enumeration issue
    expect(typeof store.increment).toBe('function');
    expect(typeof store.decrement).toBe('function');
  });
});

describe('Store $ Binding', () => {
  describe('Basic $ Binding Functionality', () => {
    it('should create $ binding with all public methods', () => {
      class TestStore extends Forest<{ count: number }> {
        constructor() {
          super({ value: { count: 0 } });
        }

        increment() {
          this.mutate(draft => {
            draft.count += 1;
          });
        }

        decrement() {
          this.mutate(draft => {
            draft.count -= 1;
          });
        }

        setCount(newCount: number) {
          this.mutate(draft => {
            draft.count = newCount;
          });
        }

        // Method with multiple parameters
        addAmount(amount: number, description?: string) {
          this.mutate(draft => {
            draft.count += amount;
          });
          if (description) {
            console.log(`Added ${amount}: ${description}`);
          }
        }
      }

      const store = new TestStore();

      // $ should exist and be an object
      expect(store.$).toBeDefined();
      expect(typeof store.$).toBe('object');

      // $ should contain bound methods
      expect(typeof store.$.increment).toBe('function');
      expect(typeof store.$.decrement).toBe('function');
      expect(typeof store.$.setCount).toBe('function');
      expect(typeof store.$.addAmount).toBe('function');
    });

    it('should exclude specific methods from $ binding', () => {
      class TestStore extends Forest<{ value: string }> {
        constructor() {
          super({ value: { value: 'test' } });
        }

        customMethod() {
          return 'custom';
        }

        // These should be excluded based on bindActions exclude list
        next(val: any) {
          super.next(val);
        }

        get value() {
          return super.value;
        }

        complete() {
          // Custom complete method
        }

        isActive() {
          return true;
        }
      }

      const store = new TestStore();

      // Should include custom methods
      expect(typeof store.$.customMethod).toBe('function');

      // Should exclude specific methods
      expect(store.$.next).toBeUndefined();
      expect(store.$.value).toBeUndefined();
      expect(store.$.complete).toBeUndefined();
      expect(store.$.isActive).toBeUndefined();
    });

    it('should exclude non-function properties from $ binding', () => {
      class TestStore extends Forest<{ data: string }> {
        constructor() {
          super({ value: { data: 'test' } });
        }

        // Properties should be excluded
        public someProperty = 'property';
        public someNumber = 42;
        public someObject = { key: 'value' };

        // Methods should be included
        someMethod() {
          return 'method';
        }
      }

      const store = new TestStore();

      // Properties should not be in $
      expect(store.$.someProperty).toBeUndefined();
      expect(store.$.someNumber).toBeUndefined();
      expect(store.$.someObject).toBeUndefined();

      // Methods should be in $
      expect(typeof store.$.someMethod).toBe('function');
    });
  });

  describe('$ Binding Method Execution', () => {
    it('should execute bound methods correctly', () => {
      class CounterStore extends Forest<{ count: number; history: string[] }> {
        constructor() {
          super({ value: { count: 0, history: [] } });
        }

        increment() {
          this.mutate(draft => {
            draft.count += 1;
            draft.history.push(`Incremented to ${draft.count}`);
          });
        }

        setCount(newCount: number) {
          this.mutate(draft => {
            draft.count = newCount;
            draft.history.push(`Set to ${newCount}`);
          });
        }

        addMultiple(amount: number, times: number) {
          this.mutate(draft => {
            const total = amount * times;
            draft.count += total;
            draft.history.push(`Added ${amount} x ${times} = ${total}`);
          });
        }
      }

      const store = new CounterStore();

      // Test single parameter method
      store.$.increment();
      expect(store.value.count).toBe(1);
      expect(store.value.history).toContain('Incremented to 1');

      // Test method with parameter
      store.$.setCount(10);
      expect(store.value.count).toBe(10);
      expect(store.value.history).toContain('Set to 10');

      // Test method with multiple parameters
      store.$.addMultiple(5, 3);
      expect(store.value.count).toBe(25);
      expect(store.value.history).toContain('Added 5 x 3 = 15');
    });

    it('should maintain proper this context in bound methods', () => {
      class ContextStore extends Forest<{ name: string; callCount: number }> {
        constructor() {
          super({ value: { name: 'test', callCount: 0 } });
        }

        updateName(newName: string) {
          // This should refer to the store instance
          expect(this).toBeInstanceOf(ContextStore);
          expect(this.value).toBeDefined();

          this.mutate(draft => {
            draft.name = newName;
            draft.callCount += 1;
          });
        }

        getStoreName() {
          return this.$name;
        }
      }

      const store = new ContextStore();

      // Call through $ binding
      store.$.updateName('newName');
      expect(store.value.name).toBe('newName');
      expect(store.value.callCount).toBe(1);

      // Method should have access to store properties
      const storeName = store.$.getStoreName();
      expect(typeof storeName).toBe('string');
      expect(storeName).toContain('forestry-store');
    });

    it('should handle method return values correctly', () => {
      class ReturnStore extends Forest<{ data: string }> {
        constructor() {
          super({ value: { data: 'initial' } });
        }

        getData() {
          return this.value.data;
        }

        setDataAndReturn(newData: string) {
          this.mutate(draft => {
            draft.data = newData;
          });
          return `Set to: ${newData}`;
        }

        calculateSum(a: number, b: number) {
          return a + b;
        }
      }

      const store = new ReturnStore();

      // Test return values
      expect(store.$.getData()).toBe('initial');

      const result = store.$.setDataAndReturn('updated');
      expect(result).toBe('Set to: updated');
      expect(store.value.data).toBe('updated');

      expect(store.$.calculateSum(5, 3)).toBe(8);
    });
  });

  describe('$ Binding Caching', () => {
    it('should cache $ binding object', () => {
      class CacheStore extends Forest<{ value: number }> {
        constructor() {
          super({ value: { value: 0 } });
        }

        testMethod() {
          return 'test';
        }
      }

      const store = new CacheStore();

      // First access
      const firstAccess = store.$;

      // Second access should return same object
      const secondAccess = store.$;

      expect(firstAccess).toBe(secondAccess);
      expect(firstAccess === secondAccess).toBe(true);
    });

    it('should maintain binding consistency across multiple calls', () => {
      class ConsistencyStore extends Forest<{ counter: number }> {
        constructor() {
          super({ value: { counter: 0 } });
        }

        increment() {
          this.mutate(draft => {
            draft.counter += 1;
          });
        }
      }

      const store = new ConsistencyStore();

      // Get bound method reference
      const boundIncrement = store.$.increment;

      // Call multiple times
      boundIncrement();
      boundIncrement();
      boundIncrement();

      expect(store.value.counter).toBe(3);
    });
  });

  describe('$ Binding with Complex Scenarios', () => {
    it('should work with async methods', async () => {
      class AsyncStore extends Forest<{ status: string; result: string | null }> {
        constructor() {
          super({ value: { status: 'idle', result: null } });
        }

        async fetchData(url: string) {
          this.mutate(draft => {
            draft.status = 'loading';
          });

          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 10));

          this.mutate(draft => {
            draft.status = 'success';
            draft.result = `Data from ${url}`;
          });

          return this.value.result;
        }
      }

      const store = new AsyncStore();

      const promise = store.$.fetchData('https://api.example.com');
      expect(store.value.status).toBe('loading');

      await promise;
      expect(store.value.status).toBe('success');
      expect(store.value.result).toBe('Data from https://api.example.com');
    });

    it('should work with methods that throw errors', () => {
      class ErrorStore extends Forest<{ value: number }> {
        constructor() {
          super({ value: { value: 0 } });
        }

        setValue(newValue: number) {
          if (newValue < 0) {
            throw new Error('Value cannot be negative');
          }
          this.mutate(draft => {
            draft.value = newValue;
          });
        }
      }

      const store = new ErrorStore();

      // Should work with valid values
      store.$.setValue(10);
      expect(store.value.value).toBe(10);

      // Should throw errors correctly
      expect(() => store.$.setValue(-5)).toThrow('Value cannot be negative');
      expect(store.value.value).toBe(10); // Should remain unchanged
    });

    it('should work with methods that call other methods', () => {
      class ChainStore extends Forest<{ x: number; y: number; history: string[] }> {
        constructor() {
          super({ value: { x: 0, y: 0, history: [] } });
        }

        setX(value: number) {
          this.mutate(draft => {
            draft.x = value;
            draft.history.push(`Set X to ${value}`);
          });
        }

        setY(value: number) {
          this.mutate(draft => {
            draft.y = value;
            draft.history.push(`Set Y to ${value}`);
          });
        }

        setPosition(x: number, y: number) {
          // Call other methods through $ binding
          this.$.setX(x);
          this.$.setY(y);
          this.mutate(draft => {
            draft.history.push(`Position set to (${x}, ${y})`);
          });
        }
      }

      const store = new ChainStore();

      store.$.setPosition(10, 20);

      expect(store.value.x).toBe(10);
      expect(store.value.y).toBe(20);
      expect(store.value.history).toContain('Set X to 10');
      expect(store.value.history).toContain('Set Y to 20');
      expect(store.value.history).toContain('Position set to (10, 20)');
    });
  });

  describe('$ Binding Edge Cases', () => {
    it('should handle stores with no custom methods', () => {
      const store = new Forest<{ data: string }>({ value: { data: 'test' } });

      // $ should exist and contain inherited methods from Forest/Store
      expect(store.$).toBeDefined();
      expect(typeof store.$).toBe('object');

      // Forest instances have inherited methods like 'set', '$branch', etc.
      // So $ won't be empty, but should not contain custom methods
      const boundMethods = Object.keys(store.$);
      expect(boundMethods.length).toBeGreaterThan(0);

      // Should contain inherited methods but no custom ones
      // Note: $ prefixed methods like $branch are excluded
      expect(boundMethods).toContain('set');
      expect(boundMethods).not.toContain('$branch'); // $ prefixed methods are excluded
    });

    it('should handle methods with special characters in names', () => {
      class SpecialStore extends Forest<{ value: number }> {
        constructor() {
          super({ value: { value: 0 } });
        }

        // Method with underscore
        set_value(newValue: number) {
          this.mutate(draft => {
            draft.value = newValue;
          });
        }

        // Method with dollar sign (should still work)
        $setValue(newValue: number) {
          this.mutate(draft => {
            draft.value = newValue;
          });
        }
      }

      const store = new SpecialStore();

      expect(typeof store.$.set_value).toBe('function');
      expect(typeof store.$.$setValue).toBe('undefined'); // $ prefixed methods are excluded

      store.$.set_value(10);
      expect(store.value.value).toBe(10);

      // $setValue is excluded, so we can't test it through $ binding
      // But we can test it directly
      store.$setValue(20);
      expect(store.value.value).toBe(20);
    });
  });
});
