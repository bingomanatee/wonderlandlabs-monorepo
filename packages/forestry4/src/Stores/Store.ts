import {
  ActionExposedRecord,
  Listener,
  Path,
  PendingValue,
  sources,
  StoreIF,
  StoreParams,
  TransFn,
  ValueTestFn,
} from '../types';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import asError from '../lib/asError';
import { isZodParser, ZodParser } from '../typeguards';
import { enableMapSet, produce } from 'immer';
import { methodize, testize } from './helpers';
import { getPath, setPath } from '../lib/path';
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
    return this.#subject;
  }

  $: Actions;

  get acts(): Actions {
    return this.$;
  }

  constructor(p: StoreParams<DataType, Actions>, noSubject = false) {
    // Store initial value
    this.initialValue = p.value;

    // Apply prep function to initial value if it exists
    const processedValue = p.prep ? p.prep({}, p.value, p.value) : p.value;

    if (!noSubject) {
      this.#subject = new BehaviorSubject(processedValue);
    }
    if ('schema' in p && p.schema) {
      this.schema = p.schema;
    }

    this.debug = !!p.debug;

    const self = this;
    // @ts-expect-error TS2345
    this.$ = methodize<DataType, Actions>(p.actions ?? {}, self);

    if (p.tests) {
      this.tests = testize<DataType>(p.tests, self);
    }

    if (p.prep) {
      this.prep = p.prep;
    }

    if (p.name && typeof p.name === 'string') {
      this.#name = p.name;
    }
    if (p.res && p.res instanceof Map) {
      p.res.forEach((value, key) => this.res.set(key, value));
    }
  }

  public debug: boolean; // more alerts on validation failures;
  public prep?: (
    input: Partial<DataType>,
    current: DataType,
    initial: DataType,
  ) => DataType;
  protected initialValue: DataType;
  public res: Map<string, any> = new Map();

  public getRes(path: Path) {
    return getPath(this.res, path);
  }

  public setRes(path: Path, value: any) {
    setPath(this.res, path, value);
  }

  #name?: string;
  get name(): string {
    if (!this.#name) {
      this.#name = 'forestry-store:' + `${Math.random()}`.split('.').pop();
    }
    return this.#name!;
  }

  complete(): DataType {
    if (!this.isActive) {
      return this.value;
    }

    const finalValue = this.value;
    this.isActive = false;

    // Complete the RxJS subject
    if (this.#subject) {
      this.#subject.complete();
    }

    return finalValue;
  }

  public pendingStack: BehaviorSubject<PendingValue<DataType>[]> =
    new BehaviorSubject<PendingValue<DataType>[]>([]);

  get hasTransaction(): boolean {
    return (
      this.pendingStack.value.filter(
        (p: PendingValue<DataType>) => p.source === sources.TRANSACTION,
      ).length > 0
    );
  }

  private currentTrans() {
    return this.pendingStack.value.reduce(
      (memo, pv: PendingValue<DataType>, index: number) => {
        if (pv.source === sources.TRANSACTION) {
          return [pv, index];
        }
        return memo;
      },
      [undefined, -1],
    );
  }

  protected updateTransaction(value: DataType) {
    // @ts-expect-error TS25488
    const [lastTrans, index] = this.currentTrans();

    if (lastTrans) {
      const lastTransUpdated = { ...lastTrans, value };
      const nextPendingStack = [...this.pendingStack.value];
      nextPendingStack[index] = lastTransUpdated;
      this.pendingStack.next(nextPendingStack);
    }
  }

  isActive: boolean = true;

  protected get pending(): DataType | undefined {
    if (!this._hasPending) {
      return undefined;
    }
    const pv = this.pendingStack.value[this.pendingStack.value.length - 1];
    if (pv) {
      return pv.value;
    }
    return undefined;
  }

  private get _hasPending() {
    return this.pendingStack.value.length > 0;
  }

  private get suspendValidation() {
    return this.pendingStack.value.reduce(
      (skip, pv: PendingValue<DataType>) => {
        return skip || pv.suspendValidation;
      },
      false,
    );
  }

  next(value: Partial<DataType>): boolean {
    if (!this.isActive) {
      throw new Error('Cannot update completed store');
    }
    if (!this.#subject) {
      throw new Error('next must be overridden for stores without #subject');
    }
    // Apply prep function if it exists to transform partial input to complete data
    const preparedValue = (
      this.prep ? this.prep(value, this.value, this.initialValue) : value
    ) as DataType;

    const { isValid, error } = this.suspendValidation
      ? { isValid: true }
      : this.validate(preparedValue);

    if (isValid) {
      if (this.hasTransaction) {
        this.updateTransaction(preparedValue);
      } else {
        this.#subject.next(preparedValue);
      }
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

  // Pending value management
  setPending(value: DataType, source = sources.NEXT): void {
    const pending: PendingValue<DataType> = {
      value,
      source,
    };
  }

  hasPending(): boolean {
    return this._hasPending;
  }

  get value() {
    if (this._hasPending) {
      return this.pending as DataType;
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

  private purgeTransaction(id: string): PendingValue<DataType> | undefined {
    const pendingTrans = [...this.pendingStack.value];
    const index = pendingTrans.findIndex(
      (p: PendingValue<DataType>) => p.id === id,
    );
    if (index < 0) {
      return;
    }
    const trans = pendingTrans[index];
    const remainder = pendingTrans.slice(0, index);
    this.pendingStack.next(remainder);
    return trans;
  }

  transact(fn: TransFn<DataType>, suspend?: boolean) {
    const id = `trans-${this.pendingStack.value.length}-${Math.random()}`;
    const pendingTrans: PendingValue<DataType> = {
      id,
      rollbackValue: this.value,
      value: this.value,
      source: sources.TRANS,
      suspendValidation: !!suspend,
    };

    this.pendingStack.next([...this.pendingStack.value, pendingTrans]);
    try {
      fn(this);
      const currentTrans = this.purgeTransaction(id);

      if (currentTrans) {
        const { isValid, error } = this.validate(currentTrans.value);
        if (!this.suspendValidation && !isValid) {
          console.error(
            'completed trans value is invalid',
            currentTrans.value,
            error,
          );
          throw error;
        }
        if (this.hasTransaction) {
          this.updateTransaction(currentTrans.value);
        } else if (isValid && this.value !== currentTrans.value) {
          this.next(currentTrans.value);
        }
      } else {
        console.warn(
          'after transaction - cannot retrieve transaction for value',
        );
      }
    } catch (err) {
      this.purgeTransaction(id);
      throw new Error(`transaction error: ${id} ${asError(err).message}`);
    }

    return this.value;
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
