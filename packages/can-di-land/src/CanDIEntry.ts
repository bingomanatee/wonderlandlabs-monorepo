import { CanDiType, GenFunction, Key, Config, Value } from './types'
import { BehaviorSubject, map } from 'rxjs'


export default class CanDIEntry {
  constructor(
    private can: CanDiType,
    public key: Key,
    config: Config,
    public resource: Value
  ) {
    if (key === 'finalValue') console.log('<<< constructor: config = ', config, 'value', resource)
    const { type, async, final, deps, args } = config;
    this.deps = Array.isArray(deps) ? deps : [];
    this.type = type;
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

  private get fnArgs() {
    const depValues = this.deps.length ? this.can.gets(...this.deps) : []
    const argValues = this.args.length ? this.args : [];
    return [...depValues, ...argValues];
  }

  private fn(fn: GenFunction) {
    return (...params: any[]) => fn(...this.fnArgs, ...params);
  }

  next(value: Value) {
    if (this.key === 'finalValue') {
      console.log('next value for entry ', this.key, '_valueSent ', this._valueSent, 'final:', this.final);
    }
    if(this.final && (this.can.has(this.key) || this._valueSent)) {
      console.error('attempt to update a finalized entry', this.key, 'with', value);
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

  private _valueSent = false;

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

}
