import type {
  ActionMethodRecord,
  ActionRecord,
  StoreIF,
  StoreParams,
} from '../types';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TestFunction } from 'vitest';

const itsAllGood = () => {};

function methodize<DataType, Actions = ActionRecord>(
  actsMethods: ActionMethodRecord,
  self: Store<DataType>,
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

export class Store<DataType, Actions = ActionRecord>
  implements StoreIF<DataType>
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
  }

  complete(): DataType {
    return undefined;
  }

  isActive: boolean = true;

  next(value: DataType): boolean {
    // @TODO: validate;
    this.#subject.next(value);
    return true;
  }

  schema?: z.ZodSchema<DataType>;

  tests?: TestFunction;

  get value() {
    return this.#subject.value as DataType;
  }

  subscribe(listener: (value: DataType) => void): Subscription {
    return this.#subject.subscribe(listener);
  }
}
