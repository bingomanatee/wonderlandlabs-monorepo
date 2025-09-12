import {
  ActionExposedRecord,
  Listener,
  Path,
  PendingValue,
  StoreIF,
  StoreParams,
  TransParams,
  ValueTestFn,
} from '../types';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import asError from '../lib/asError';
import { isZodParser, ZodParser } from '../typeguards';
import { enableMapSet, produce } from 'immer';
import { methodize, testize } from './helpers';
import { getPath } from '../lib/path';
import { pathString } from '../lib/combinePaths';

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
    return this.#subject!;
  }

  $: Actions;

  get acts(): Actions {
    return this.$;
  }

  constructor(p: StoreParams<DataType, Actions>, noSubject = false) {
    // Apply prep function to initial value if it exists
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
    if (p.prep) {
      this.prep = p.prep.bind(this);
      if (this.#subject) {
        this.#subject.next(this.prep!(this.value!, this.value!));
      }
    }

    if (p.name && typeof p.name === 'string') {
      this.#name = p.name;
    }
    if (p.res && p.res instanceof Map) {
      p.res.forEach((value, key) => this.res.set(key, value));
    }
  }

  public debug: boolean; // more alerts on validation failures;
  public prep?: (input: Partial<DataType>, current: DataType) => DataType;
  public res: Map<string, any> = new Map();

  #name?: string;
  get name(): string {
    if (!this.#name) {
      this.#name = 'forestry-store:' + `${Math.random()}`.split('.').pop();
    }
    return this.#name!;
  }

  complete(): DataType {
    if (!this.isActive) {
      return this.value!;
    }

    const finalValue = this.value;
    this.isActive = false;

    // Complete the RxJS subject
    if (this.#subject) {
      this.#subject.complete();
    }

    return finalValue;
  }

  isActive: boolean = true;

  next(value: Partial<DataType>): void {
    if (!this.isActive) {
      throw new Error('Cannot update completed store');
    }

    // Apply prep function if it exists to transform partial input to complete data
    const preparedValue = this.prep
      ? this.prep(value, this.value!)
      : (value as DataType);

    const { isValid, error } = this.validate(preparedValue);
    if (!this.subject) {
      throw new Error('Store requires subject -- or override of next()');
    }
    if (isValid) {
      this.#subject!.next(preparedValue);
      return;
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

  public get suspendValidation() {
    return this.#transStack.value.some((p) => p.suspendValidation);
  }

  transact({ action, suspendValidation }: TransParams) {
    let transId: string = '';
    try {
      transId = this.#queuePendingTrans(suspendValidation);
      const self = this;

      function boundFn(value: DataType) {
        return action.call(self, value);
      }

      boundFn(this.value!);
      this.#commitTransact(transId);
    } catch (err) {
      if (transId) {
        this.#revertTransact(transId);
      }
      throw err;
    }
  }

  readonly #transStack: BehaviorSubject<PendingValue<DataType>[]> =
    new BehaviorSubject<PendingValue<DataType>[]>([]);

  // for debugging
  observeTransStack(listener: Listener<PendingValue<DataType>[]>) {
    return this.#transStack.subscribe(listener);
  }

  #commitTransact(id: string) {
    const index = this.#transStack.value.findIndex((p) => p.id === id);
    if (index >= 0) {
      const trans = this.#transStack.value[index]!;
      if (trans) {
        trans.isTransaction = false;
      }
    }

    if (!this.#transStack.value.some((p) => p.isTransaction)) {
      const last = this.#transStack.value.pop();
      this.#transStack.next([]);
      if (last) {
        this.next(last.value);
      }
    }
  }

  queuePendingValue(value: DataType): string {
    const digits = `${Math.random()}`.replace('0.', '');
    const id = `level_${this.#transStack.value.length}-${digits}-trans`;

    const next = [
      ...this.#transStack.value,
      {
        id,
        value,
        isTransaction: false,
      },
    ];
    this.#transStack.next(next);
    return id;
  }

  #collapseTransStack = () => {
    if (this.#transStack.value.some((p) => p.isTransaction)) {
      return;
    }

    const last = this.#transStack.value.pop();
    this.#transStack.next([]);
    return last;
  };

  dequeuePendingValue(id: string): PendingValue<DataType> | undefined {
    const queuedIndex = this.#transStack.value.findIndex((p) => p.id === id);
    if (queuedIndex === this.#transStack.value.length - 1) {
      if (!this.#transStack.value.some((p) => p.isTransaction)) {
        return this.#collapseTransStack();
      }
    }
  }

  #queuePendingTrans(suspendValidation = false): string {
    const digits = `${Math.random()}`.replace('0.', '');
    const id = `level_${this.#transStack.value.length}-${digits}-trans`;
    const next = [
      ...this.#transStack.value,
      {
        id,
        value: this.value,
        suspendValidation,
        isTransaction: true,
      },
    ];
    this.#transStack.next(next);
    return id;
  }

  #revertTransact(id: string) {
    const index = this.#transStack.value.findIndex((p) => p.id === id);
    if (index >= 0) {
      const next = this.#transStack.value.slice(0, index);
      this.#transStack.next(next);
    }
  }

  validate(value: unknown) {
    if (this.suspendValidation) {
      return { isValid: true };
    }
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
    const tsv = this.#transStack.value;
    if (tsv.length) {
      return tsv[tsv.length - 1].value;
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

  get(path?: Path): any {
    if (!path || (Array.isArray(path) && path.length === 0)) {
      return this.value;
    }
    const pathArray = Array.isArray(path) ? path : pathString(path).split('.');
    return getPath(this.value, pathArray);
  }

  mutate(producerFn: (draft: any) => void, path?: Path): any {
    if (!path || (Array.isArray(path) && path.length === 0)) {
      // Mutate the entire state
      const newValue = produce(this.value, producerFn);
      this.next(newValue);
      return this.value;
    } else {
      // Mutate a specific path within the state
      const pathArray = Array.isArray(path)
        ? path
        : pathString(path).split('.');
      const newValue = produce(this.value, (draft) => {
        // Get the target object at the specified path
        const target = getPath(draft, pathArray);
        if (target !== undefined) {
          // Apply the producer function to the target
          producerFn(target);
        }
      });
      this.next(newValue);
      return this.value;
    }
  }
}
