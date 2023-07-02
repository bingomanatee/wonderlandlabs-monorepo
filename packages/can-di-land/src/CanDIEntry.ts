import { CanDiType, GenFunction, Key, Config, Value, ValueMap } from './types'
import { BehaviorSubject, map } from 'rxjs'
import { ce } from './utils'


export default class CanDIEntry {
  constructor(
    private can: CanDiType,
    public key: Key,
    config: Config,
    public resource: Value
  ) {
    const { type, async, final, deps, args } = config;
    this.deps = Array.isArray(deps) ? deps : [];
    this.type = type;

    if (this.deps.length && this.type === 'value') {
      throw new Error(`cannot define dependencies on value types for ${key}`);
    }

    this.async = !!async;
    this.final = !!final;
    this.args = args || []
    this.stream = new BehaviorSubject(resource);
    this._watchResource();
  }

  async: boolean;
  private args: any[];
  public deps: Key[];
  type: string;
  final: boolean;
  private stream: BehaviorSubject<any>

  private _watchResource() {
    const self = this;
    this.stream.pipe(
      map((value) => self.transform(value))
    ).subscribe((value) => this._onValue(value))
  }

  private fnArgs(map?: ValueMap) {
    const argValues = this.args.length ? this.args : [];
    return [...this.depValues(map), ...argValues];
  }

  private depValues(map?: ValueMap) {
    if (!this.deps.length) return [];
    if (!map) return this.can.gets(this.deps);
    return this.deps.map((key) => map.get(key));
  }

  private fn(fn: GenFunction, map?: ValueMap) {
    return (...params: any[]) => fn(...this.fnArgs(map), ...params);
  }

  computeFor(map: ValueMap) {
    const fn = this.value;
    if (typeof fn !== 'function') {
      throw new Error(`${this.key} cannot computeFor -- non function`);
    }
    return this.fn(fn, map)();
  }

  next(value: Value) {
    if(this.final && (this.can.has(this.key) || this._valueSent)) {
      ce('attempt to update a finalized entry', this.key, 'with', value);
      throw new Error(`cannot update finalized entry ${this.key}`)
    }
    this.stream.next(value);
  }

  get value() {
    return this.stream.value;
  }

  transform(value: Value) {
    let out = value;
    switch (this.type) {
      case 'value':
        out = value;
        break;

      case 'func':
        out = this.fn(value);
        break;

      case 'comp':
        out = this.fn(value)();
        break;
    }
    return out;
  }

  /**
   * indicates whether this entry is open to being updated.
   */
  public get active() {
    return !(this.final && this._valueSent);

  }

  /**
   * whether this entry has all the deps it needs to allow its value to be added to the CanDI's map
   * As it is used in _updateComps, where the "next map" is detached and extensively preprocessed,
   * the "value map" is optionally passed in as a parameter;
   * in other situations, the can's `has(..)` method is sufficient.
   */
  public resolved(map?: ValueMap) {
    if (!this.deps.length) return true;
    if (!map) {
      return this.can.has(this.deps);
    }
    return this.deps.every((key) => map!.has(key));
  }

  private _valueSent = false;

  /**
   * used in subscribing to this entries' stream
   */
  _onValue(value: Value) {
    if (this.final && this._valueSent) {
      return;
    }

    if (this.deps.length && !this.can.has(this.deps)) {
      return;
    }

    if (this.async) {
      this._valueSent = true;
      this.can.pq.set(this.key, value);
    } else {
      this.can.events.next({ type: 'value', target: this.key, value })
    }
    this._valueSent = true;
  }

  checkForLoop(subEntry?: CanDIEntry) {
    const checkEachKey = (key: Key) => {
      const entry = this.can.entries.get(key);
      if (!entry) return;
      if (entry.deps.includes(this.key)) {
        throw new Error(`infinite dependency loop between ${this.key} and ${entry.key}`);
      }
      this.checkForLoop(entry); // check for deeper loops
    }

    if (!subEntry) {
      this.deps.forEach(checkEachKey)
    } else {
      subEntry.deps.forEach(checkEachKey)
    }
  }

}
