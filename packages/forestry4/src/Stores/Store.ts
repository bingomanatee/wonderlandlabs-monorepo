import {
  ActionExposedRecord,
  StoreIF,
  StoreParams,
  ValueTestFn,
  Listener,
} from '../types';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import asError from '../lib/asError';
import { isZodParser, ZodParser } from '../typeguards';
import { enableMapSet } from 'immer';
import { methodize, testize } from './helpers';

// Enable Immer support for Map and Set
enableMapSet();

export class Store<
  DataType,
  Actions extends ActionExposedRecord = ActionExposedRecord,
> implements StoreIF<DataType, Actions>
{
  /**
   * note - for consistency with the types subject is a generic subject;
   * however internally it is a BehaviorSubject.
   * @private
   */
  #subject?: BehaviorSubject<DataType>;
  get subject(): Observable<DataType> {
    return this.#subject;
  }

  $: Actions;

  get acts(): Actions {
    return this.$;
  }

  constructor(p: StoreParams<DataType, Actions>, noSubject = false) {
    if (!noSubject) {
      this.#subject = new BehaviorSubject(p.value);
    }
    if ('schema' in p && p.schema) {
      this.schema = p.schema;
    }

    this.debug = !!p.debug;

    const self = this;
    this.$ = methodize<DataType, Actions>(p.actions ?? {}, self);

    if (p.tests) {
      this.tests = testize<DataType>(p.tests, self);
    }

    if (p.name && typeof p.name === 'string') {
      this.#name = p.name;
    }
  }

  public debug: boolean; // more alerts on validation failures;
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
    const { isValid, error } = this.validate(value);
    if (!this.subject) {
      throw new Error('Store requires subject -- or override of next()');
    }
    if (isValid) {
      this.#subject!.next(value);
      return true;
    }
    if (this.debug) {
      console.error(
        'cannot update ',
        this.name,
        'with',
        value,
        '(current: ',
        this.value,
        ')',
        error,
      );
    }
    throw asError(error);
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

  tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];

  get value() {
    if (this.#pending) {
      return this.#pending;
    }
    if (!this.#subject) {
      throw new Error('Store requires subject or overload of value');
    }
    return this.#subject.value as DataType;
  }

  subscribe(listener: Listener<DataType>): Subscription {
    return this.subject!.pipe(distinctUntilChanged(isEqual)).subscribe(
      listener,
    );
  }
}
