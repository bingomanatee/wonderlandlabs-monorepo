import {
  Listener,
  Path,
  PendingValue,
  StoreIF,
  StoreParams,
  TransFn,
  TransParams,
  ValueTestFn,
} from '../types';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import asError from '../lib/asError';
import { isZodParser, ZodParser } from '../typeguards';
import { enableMapSet, produce } from 'immer';
import { testize } from './helpers';
import { getPath, setPath } from '../lib/path';
import { pathString } from '../lib/combinePaths';

// Enable Immer support for Map and Set
enableMapSet();

export class Store<DataType> implements StoreIF<DataType>
{
  constructor(p: StoreParams<DataType>, noSubject = false) {
    // Apply prep function to initial value if it exists
    if (!noSubject) {
      this.#subject = new BehaviorSubject(p.value);
    }

    if (p.schema) {
      this.$schema = p.schema;
    }

    this.debug = !!p.debug;

    this.#tests = p.tests ? testize<DataType>(p.tests, this) : undefined;
    if (p.prep) {
      this.#prep = p.prep.bind(this);
      if (this.#subject) {
        this.#subject.next(this.prep(this.value!));
      }
    }

    if (p.name && typeof p.name === 'string') {
      this.#name = p.name;
    }
    if (p.res && p.res instanceof Map) {
      p.res.forEach((value, key) => this.$res.set(key, value));
    }
  }

  /**
   * note - for consistency with the types $subject is a generic $subject;
   * however internally it is a BehaviorSubject.
   * @private
   */
  #subject?: BehaviorSubject<DataType>;
  get $subject(): Observable<DataType> {
    return this.#subject!;
  }



  public debug: boolean; // more alerts on validation failures;
  #prep?: (input: Partial<DataType>, current: DataType) => DataType;

  prep(value: Partial<DataType>) {
    if (this.#prep) {
      return this.#prep.call(this, value, this.value);
    }
    return value as DataType;
  }

  public $res: Map<string, any> = new Map();

  #name?: string;
  get $name(): string {
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

    // Complete the RxJS $subject
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
    if (!this.#subject) {
      throw new Error('Store requires $subject -- or override of next()');
    }

    const preparedValue = this.prep(value);
    const { isValid, error } = this.$validate(preparedValue);
    if (isValid) {
      if (this.#hasTrans()) {
        this.queuePendingValue(preparedValue);
      } else {
        this.#subject!.next(preparedValue);
      }
      return;
    }
    if (this.debug) {
      this.$broadcast({ action: 'next-error', error, value: preparedValue });
    }
    throw asError(error);
  }

  #test(fn: ValueTestFn<DataType>, value: unknown) {
    const result = fn.call(this, value, this);
    if (result) {
      throw asError(result);
    }
    // no result/output for valid elements
  }

  public get suspendValidation() {
    return this.#transStack.value.some((p) => p.suspendValidation);
  }

  $transact(params: TransParams | TransFn, suspend?: boolean) {
    if (typeof params === 'function') {
      this.$transact({
        action: params,
        suspendValidation: !!suspend,
      });
      return;
    }
    const { action, suspendValidation } = params;
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
    let changed = false;
    const nextStack = this.#transStack.value.map((p) => {
      if (p.id === id) {
        changed = true;
        return {
          ...p,
          isTransaction: false,
          suspendValidation: false,
        };
      } else {
        return p;
      }
    });
    if (changed) {
      this.#transStack.next(nextStack);
    }
    this.#checkTransComplete();
  }

  #checkTransComplete() {
    if (!this.#transStack.value.some((p) => p.isTransaction)) {
      const last = this.#transStack.value.pop();
      this.#transStack.next([]);
      if (last) {
        this.$broadcast({
          action: 'checkTransComplete',
          phase: 'next',
          value: last.value,
        });
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

  #hasTrans() {
    return this.#transStack.value.some((p) => p.isTransaction);
  }

  #collapseTransStack = () => {
    if (this.#hasTrans()) {
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

  get $root() {
    return this;
  }

  get $isRoot() {
    return true;
  }

  $parent: undefined;

  public $broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || !this.$parent) {
      this.receiver.next(message);
    }
    if (this.$root && this.$root !== this) {
      this.$root.$broadcast(message);
    }
  }

  public receiver = new Subject();

  // $validate determines if a value can be sent to next
  // _in the current context_
  // -- i.e., depending on on transactional conditions
  $validate(value: DataType) {
    if (this.suspendValidation) {
      return { isValid: true };
    }
    if (isZodParser(this.$schema)) {
      try {
        this.$schema.parse(value); // throws an error if the value is not valid
      } catch (err) {
        return {
          isValid: false,
          error: asError(err),
          source: '$schema',
        };
      }
    }

    return this.$test(value);
  }

  $isValid(value: DataType): boolean {
    return this.$validate(value).isValid;
  }

  $schema?: ZodParser;

  #tests?: ValueTestFn<DataType> | ValueTestFn<DataType>[];

  $test(value: DataType) {
    let lastFn;
    if (this.#tests) {
      try {
        if (Array.isArray(this.#tests)) {
          for (const test of this.#tests) {
            lastFn = test;
            this.#test(test, value);
          }
        } else if (typeof this.#tests === 'function') {
          lastFn = this.#tests;
          this.#test(this.#tests, value);
        }
      } catch (err) {
        return {
          isValid: false,
          value,
          error: asError(err),
          testFn: lastFn,
        };
      }
    }
    return {
      isValid: true,
    };
  }

  get value() {
    const tsv = this.#transStack.value;
    if (tsv.length) {
      return tsv[tsv.length - 1].value;
    }
    if (!this.#subject) {
      throw new Error('Store requires $subject or overload of value');
    }
    return this.#subject.value as DataType;
  }

  subscribe(listener: Listener<DataType>): Subscription {
    return this.$subject!.pipe(distinctUntilChanged(isEqual)).subscribe(
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

  set(path: Path, value: unknown) {
    const next = produce(this.value, (draft) => {
      setPath(draft, path, value);
    });
    this.next(next);
  }

  mutate(producerFn: (draft: any) => void, path?: Path): any {
    if (!path || (Array.isArray(path) && path.length === 0)) {
      // Mutate the entire state
      const newValue = produce(this.value, producerFn);
      this.next(newValue);
      return this.value;
    } else {
      // Mutate a specific $path within the state
      const pathArray = Array.isArray(path)
        ? path
        : pathString(path).split('.');
      const newValue = produce(this.value, (draft) => {
        // Get the target object at the specified $path
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
