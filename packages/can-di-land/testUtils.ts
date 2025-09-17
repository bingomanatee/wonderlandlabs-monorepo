import { GenFunction, Key, ResourceType, Value } from './src/types';
import { ResDef, ResDefMutator } from './src/types';
import { CanDI } from './src';
import { c } from '@wonderlandlabs/collect';

/**
 * this is a general utility to prepare a CanDI instance with a constructor and a $test body. It injects a new CanDI
 * into the $test method passed.
 * returns a function that is a decorated version of the input $test case,
 * passing a new CanDI instance to it with the constructor passed through.
 */
export function subject(
  initParams: ResDef[],
  test: (can: CanDI) => Promise<any> | void,
  alert?: string
): () => any {
  const can = new CanDI(initParams);
  return () => {
    if (alert) {
      /*console.log(alert, c(can.configs).getReduce((list, config, key) => {
        return [...list, key, 'conf:', config]
      }, []))*/
    }
    test(can);
  };
}

/***
 * Constructor tests --- value
 */

export function async_value_is_eventually_present(key: Key, pending: Promise<any>) {
  return async (can: CanDI) => {
    expect(can.has(key)).toBeFalsy();
    await pending;
    expect(can.has(key)).toBeTruthy();
  };
}

export function entry_value(name: Key, value: any) {
  return (can: CanDI) => {
    expect(can.has(name)).toBeTruthy();
    expect(can.get(name)).toEqual(value);
  };
}

/**
 * Constructor tests -- func
 */

export function entry__exists(key: Key, type: ResourceType) {
  return (can: CanDI) => {
    expect(can.has(key)).toBeTruthy();
    expect(can.entries.get(key)?.type).toBe(type);
  };
}

export function summerFn(...args: number[]) {
  return args.reduce((m, v) => m + v, 0);
}

export function summerFnAsync(...args: number[]) {
  return Promise.resolve(args.reduce((m, v) => m + v, 0));
}

export function delay(value: any, time: number) {
  return new Promise((done) => {
    setTimeout(() => done(value), time);
  });
}

export function cannot_redefine_async(key: Key, promise: Promise<any>) {
  return async (can: CanDI) => {
    console.log('cannot_redefine_async: can entries are...');
    can.entries.forEach((entry, key) => {
      console.log(key, ':', entry);
    });
    // cannot redefine value BEFORE it resolves...
    expect(() => can.set(key, 100)).toThrow();
    await promise;
    // ... or after
    expect(() => can.set(key, 100)).toThrow();
  };
}
