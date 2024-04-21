import {
  ForestId,
  ForestIF,
  ForestItemIF,
  TransID,
  TransIF,
  TransValue,
  UpdateDirType,
} from './types';
import { v4 } from 'uuid';
import { BehaviorSubject, Observer, Subscription } from 'rxjs';

export default class ForestItem implements ForestItemIF {
  forestId: ForestId;

  constructor(public name: string, value: unknown, public forest: ForestIF) {
    this.forestId = v4();
    forest.register(this);
    this.observable.next(value);
  }

  public observable: BehaviorSubject<unknown> = new BehaviorSubject<unknown>(
    null
  );

  /**
   * This is the _last valid value_ of the branch. note - the first value of the branch
   * is "assumed to be valid" though it may indeed have errors based on leafs etc.
   *
   * This is used among other things to prevent the type of the branch to switch based on updates;
   * that is you can't update the value of a branch<Array> with an object or vice versa.
   */
  public get committedValue() {
    return this.observable.value;
  }

  public subscribe(observer: Observer<unknown>): Subscription {
    return this.observable.subscribe(observer);
  }

  public set value(newValue: unknown) {
    this.forest.trans('change', (trans) => this.change(trans, newValue));
  }

  public get value() {
    if (this.tempValues.length) {
      return this.tempValues[this.tempValues.length - 1].value;
    }
    return this.observable.value;
  }

  commit(): void {
    if (this.hasTempValues) {
      this.observable.next(this.value);
    }
  }

  flushTemp() {
    this.tempValues = [];
  }

  get hasTempValues() {
    return this.tempValues.length >= 0;
  }

  report() {
    return {
      id: this.forestId,
      name: this.name,
      obsValue: this.observable.value,
      tempValues: this.tempValues,
    };
  }

  change(trans: TransIF, value: unknown) {
    try {
      this.pushTempValue(value, trans.id);
      this.validate();
    } catch (err) {
      this.removeTempValues(trans.id);
      throw err;
    }
  }

  public reflectPendingValue(_id: TransID, _direction?: UpdateDirType) {}

  private tempValues: TransValue[] = [];

  public pushTempValue(value: unknown, id: TransID) {
    this.tempValues.push({ value, id });
  }

  public validate() {}

  private removeTempValues(id: TransID) {
    const place = this.tempValues.findIndex((candidate) => candidate.id === id);
    if (place >= 0) {
      this.tempValues = this.tempValues.slice(0, place);
    }
  }
}
