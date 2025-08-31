import {
  ActionMethodRecord,
  ActionRecord,
  StoreIF,
  StoreParams,
  ValueTestFn,
} from '../types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TestFunction } from 'vitest';
import asError from '../lib/asError';
import { isZodParser, ZodParser } from '../typeguards';

const itsAllGood = () => {};

function methodize<DataType, Actions extends ActionRecord = ActionRecord>(
  actsMethods: ActionMethodRecord,
  self: Store<DataType, Actions>,
): Actions {
  return Array.from(Object.keys(actsMethods)).reduce((memo, key) => {
    const fn = actsMethods[key];

    function f(...args: any[]) {
      return fn(self.value, ...args);
    }

    memo[key] = f.bind(self);
    return memo as Partial<Actions>;
  }, {}) as Actions;
}

export class Store<DataType, Actions extends ActionRecord = ActionRecord>
  implements StoreIF<DataType, Actions>
{
  $: Actions;

  get acts(): Actions {
    return this.$;
  }

  #subject: BehaviorSubject<DataType>;

  constructor(p: StoreParams<DataType>) {
    this.#subject = new BehaviorSubject(p.value);
    this.tests = p.tests ?? itsAllGood;
    if ('schema' in p && p.schema) {
      this.schema = p.schema;
    }

    const self = this;
    this.$ = methodize<DataType, Actions>(p.acts ?? {}, self);
    if (p.name && typeof p.name === 'string') {
      this.#name = p.name;
    }
  }

  #name?: string;
  get name(): string {
    if (!this.#name) {
      this.#name = 'forestry-store:' + `${Math.random()}`.split('.').pop();
    }
    return this.#name!;
  }

  complete(): DataType {
    return undefined;
  }

  isActive: boolean = true;
  #pending: DataType | undefined;

  next(value: DataType): boolean {
    try {
      const { isValid, error } = this.validate(value);
      if (isValid) {
        this.#subject.next(value);
        return true;
      }
      throw error;
    } catch (e) {
      console.error(
        'cannot update ',
        this.name,
        'with',
        value,
        '(current: ',
        this.value,
        ')',
        e,
      );
      throw asError(e);
    }
  }

  #test(fn: ValueTestFn<DataType>, value: unknown) {
    const result = fn(value, this);
    if (result) {
      throw asError(result);
    }
    // no result/output for valid elements
  }

  validate(value: unknown) {
    try {
      if (isZodParser(this.schema)) {
        this.schema.parse(value); // throws an error if the value is not valid
      }
      if (this.tests) {
        if (Array.isArray(this.tests)) {
          for (const test of this.tests) {
            this.#test(test, value);
          }
        } else if (typeof this.tests === 'function') {
          this.#test(this.tests, value);
        } else {
          throw new Error(
            'bad value for tests - must be function or array of functions',
          );
        }
      }
      return {
        isValid: true,
      };
    } catch (e) {
      return {
        isValid: false,
        error: asError(e),
      };
    }
  }

  isValid(value: unknown): boolean {
    return this.validate(value).isValid;
  }

  schema?: ZodParser;

  tests?: TestFunction;

  get value() {
    if (this.#pending) {
      return this.#pending;
    }
    return this.#subject.value as DataType;
  }

  subscribe(listener: (value: DataType) => void): Subscription {
    return this.#subject.subscribe(listener);
  }
}
