import { BehaviorSubject, filter, Subject, Subscription } from 'rxjs'
import { Config, isEventInit, isEventValue, Key, ResDef, ResEvent, ResourceType, Value, ValueMap } from './types'
import { PromiseQueue } from './PromiseQueue'
import CanDIEntry from './CanDIEntry'

export class CanDI {

  constructor(values?: ResDef[]) {
    this._initEvents();
    this._initPQ();
    values?.forEach((val) => {
      this.events.next({ type: 'init', target: val.key, value: val })
      // would it be better to initialize the can's props "en masse"?
    });
  }

  public values = new BehaviorSubject<ValueMap>(new Map())
  public entries = new Map<Key, CanDIEntry>();
  public events = new Subject<ResEvent>();
  public pq = new PromiseQueue();

  // ----------- change --------------

  set(key: Key, value: Value) {
    const entry = this.entry(key);
    if (!entry) {
      throw new Error(`cannot set value of entry: ${key}`)
    }
    if (key === 'finalValue') console.log('----- setting ', key, value);
    entry.next(value);
    if (key === 'finalValue') console.log('-----  DONE setting ', key, value);
  }

  add(key: Key, value: Value, config? : Config | ResourceType) : void {
    if (this.entries.has(key)) {
      throw new Error(`cannot redefine entry ${key}`)
    }
    if (!config) {
      return this.add(key, value, {type: 'value'})
    }
    if (typeof config === 'string') {
      return this.add(key, value, {type: config})
    }

    this.events.next({ type: 'init', target: key, value: {key, value, config} })
  }

  // ------- introspection/querying --------------

  get(key: Key): Value | undefined {
    const map = this.values.value;
    return map.has(key) ? map.get(key) : undefined;
  }

  gets(keys: Key[]): Value | undefined {
    return keys.map(key => this.get(key))
  }

  has(key: Key | Key[]): boolean {
    if (Array.isArray(key)) {
      return key.every((subKey) => this.has(subKey));
    }
    return this.values.value.has(key);
  }

  entry(key: Key) {
    return this.entries.get(key);
  }

  // --------------- event management -------------
  private _eventSubs: Subscription[] = [];

  public complete() {
    this._eventSubs.forEach(sub => sub.unsubscribe())
  }

  private _pqSub?: Subscription;

  private _initPQ() {
    const self = this;
    this._pqSub = this.pq.events.subscribe(({ key, value }) => {
      self._onValue(key, value);
    })
  }

  private _initEvents() {
    this._eventSubs
      .push(
        this.events
          .pipe(
            filter(isEventValue)
          )
          .subscribe((event) => this._onValue(event.target, event.value))
      )

    this._eventSubs
      .push(
        this.events
          .pipe(
            filter(isEventInit)
          )
          .subscribe((event) => this._onInit(event.target, event.value))
      )
  }

  _onInit(key: Key, data: ResDef) {
    if (this.entries.has(key)) {
      console.error('key', key, 'initialized twice');
      return;
    }

    const { config, type, value } = data;
    let myConfig = config;
    if (!myConfig) {
      if (!type) {
        myConfig = {type: 'value'}
      } else {
        myConfig = {type}
      }
    }

    if (key === 'finalValue') {
      console.log('========= data for', key, data);
      console.log('======== values for ', key, 'config:', config, 'my', myConfig, 'value:', value);
    }
    this.entries.set(
      key,
      new CanDIEntry(
        this,
        key,
        myConfig!,
        value
      )
    )
  }

  private _onValue(key: Key, value: any) {
    const map = new Map(this.values.value);
    map.set(key, value);
    this.values.next(map);
  }
}
