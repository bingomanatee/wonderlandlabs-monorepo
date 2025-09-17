import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { Store } from './Store';
import type { StoreIF } from '../types';
import { isStore, isObj } from '../typeguards';

describe('Store', () => {
  describe('constructor', () => {
    it('should create a store with initial value', () => {
      const store = new Store({ value: 42 });
      expect(store.value).toBe(42);
    });

    it('should create a store with schema validation', () => {
      const schema = z.number().min(0);
      const store = new Store({ value: 42, schema });

      expect(store.$schema).toBe(schema);
    });

    it('should create a store with tests function', () => {
      const testFn = vi.fn();
      const store = new Store({ value: 42, tests: testFn });
      store.$test(40);
      expect(testFn).toHaveBeenCalled();
    });
  });

  describe('value management', () => {
    it('should update value with next()', () => {
      const store = new Store({ value: 10 });
      store.next(20);
      expect(store.value).toBe(20);
    });

    it('should be active by default', () => {
      const store = new Store({ value: 42 });
      expect(store.isActive).toBe(true);
    });
  });

  describe('subscription', () => {
    it('should allow subscription to value changes', () => {
      const store = new Store({ value: 0 });
      const mockListener = vi.fn();

      const subscription = store.subscribe(mockListener);

      expect(mockListener).toHaveBeenCalledWith(0);

      store.next(5);
      expect(mockListener).toHaveBeenCalledWith(5);

      subscription.unsubscribe();
    });

    it('should handle multiple subscribers', () => {
      const store = new Store({ value: 'initial' });
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      store.subscribe(listener1);
      store.subscribe(listener2);

      store.next('updated');

      expect(listener1).toHaveBeenCalledWith('updated');
      expect(listener2).toHaveBeenCalledWith('updated');
    });
  });



  describe('complete', () => {
    it('should return final value and mark store as inactive', () => {
      const store = new Store({ value: 'test' });

      // Initially active
      expect(store.isActive).toBe(true);

      // Complete should return final value
      const finalValue = store.complete();
      expect(finalValue).toBe('test');

      // Should be inactive after completion
      expect(store.isActive).toBe(false);

      // Should not allow updates after completion
      expect(() => store.next('updated')).toThrow(
        'Cannot update completed store',
      );

      // Calling complete again should return the same value
      expect(store.complete()).toBe('test');
    });
  });

  describe('schema validation', () => {
    it('should throw error when next() receives invalid data', () => {
      const schema = z.number().min(0);
      const store = new Store({ value: 5, schema });

      expect(() => store.next(-1)).toThrowError();
      expect(store.value).toBe(5); // value should remain unchanged
    });

    it('should not broadcast when validation fails', () => {
      const schema = z.string().min(3);
      const store = new Store({ value: 'hello', schema });
      const listener = vi.fn();

      store.subscribe(listener);
      listener.mockClear(); // Clear initial subscription call

      expect(() => store.next('hi')).toThrowError();
      expect(listener).not.toHaveBeenCalled();
      expect(store.value).toBe('hello');
    });

    it('should allow valid data through schema', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().min(0),
      });

      const store = new Store({
        value: { name: 'John', age: 30 },
        schema,
      });

      expect(() => store.next({ name: 'Jane', age: 25 })).not.toThrow();
      expect(store.value).toEqual({ name: 'Jane', age: 25 });
    });
  });

  describe('test function validation', () => {
    it('should allow test functions to access store via this', () => {
      const TOO_BIG = 'cannot more than double current value';
      const POS = 'must be positive';
      const testFn = function (this: Store<number>, value: unknown) {
        if (typeof value !== 'number') {
          return 'must be number';
        }
        if (value < 0) {
          return POS;
        }
        if (value > this.value * 2) {
          return TOO_BIG;
        }
        return null;
      };

      const store = new Store({ value: 10, tests: testFn });

      expect(() => store.next(15)).not.toThrowError(); // valid: 15 < 20
      expect(() => store.next(35)).toThrowError(TOO_BIG); // invalid: 35 > 30 (15 * 2)
      expect(() => store.next(-5)).toThrowError(POS); // invalid: negative
    });

    it('should work with array of test functions', () => {
      const tests = [
        function (this: Store<string>, value: unknown) {
          if (typeof value !== 'string') {
            return 'must be string';
          }
          return null;
        },
        function (this: Store<string>, value: unknown) {
          if ((value as string).length < this.value.length) {
            return 'cannot shrink';
          }
          return null;
        },
      ];

      const store = new Store({ value: 'hello', tests });

      expect(() => store.next('hello world')).not.toThrowError(); // valid: longer
      expect(() => store.next('hi')).toThrowError(); // invalid: shorter
      // @ts-expect-error TS2345
      expect(() => store.next(123)).toThrowError(); // invalid: not string
    });
  });

  describe('type safety', () => {
    it('should work with typed data', () => {
      interface UserData {
        name: string;
        age: number;
      }

      const store = new Store<UserData>({
        value: { name: 'John', age: 30 },
      });

      expect(store.value.name).toBe('John');
      expect(store.value.age).toBe(30);

      // TypeScript should enforce the correct type
      store.next({ name: 'Jane', age: 25 });
      expect(store.value.name).toBe('Jane');
      expect(store.value.age).toBe(25);
    });
  });

  describe('typeguards', () => {
    it('should identify objects with isObj', () => {
      expect(isObj({})).toBe(true);
      expect(isObj({ a: 1 })).toBe(true);
      expect(isObj([])).toBe(true);

      expect(isObj(null)).toBe(false);
      expect(isObj(undefined)).toBe(false);
      expect(isObj('string')).toBe(false);
      expect(isObj(42)).toBe(false);
      expect(isObj(true)).toBe(false);
    });

    it('should identify Store instances with isStore', () => {
      const store = new Store({ value: 42 });
      expect(isStore(store)).toBe(true);

      expect(isStore(null)).toBe(false);
      expect(isStore(undefined)).toBe(false);
      expect(isStore({})).toBe(false);
      expect(isStore({ value: 42 })).toBe(false); // missing required methods
      expect(isStore({ next: () => {} })).toBe(false); // missing required props
    });
  });
});
