import { BehaviorSubject, filter, Subject, Subscription } from 'rxjs'
import { Config, isEventInit, isEventValue, Key, ResDef, ResEvent, ResourceType, Value, ValueMap } from './types'
import { PromiseQueue } from './PromiseQueue'
import CanDIEntry from './CanDIEntry'

export class CanDI {

  constructor(values?: ResDef[], maxChangeLoops = 30) {
    this._initEvents();
    this._initPQ();
    values?.forEach((val) => {
      this.events.next({ type: 'init', target: val.key, value: val })
      // would it be better to initialize the can's props "en masse"?
    });
    this.maxChangeLoops = maxChangeLoops;
  }

  private maxChangeLoops: number;
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
    entry.next(value);
  }

  add(key: Key, value: Value, config?: Config | ResourceType): void {
    if (this.entries.has(key)) {
      throw new Error(`cannot redefine entry ${key}`)
    }
    if (!config) {
      return this.add(key, value, { type: 'value' })
    }
    if (typeof config === 'string') {
      return this.add(key, value, { type: config })
    }

    this.events.next({ type: 'init', target: key, value: { key, value, config } })
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
        myConfig = { type: 'value' }
      } else {
        myConfig = { type }
      }
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
    this._updateComps(key, map);
    this.values.next(map);
  }

  public entriesDepOn(key: Key) {
    return Array.from(this.entries.values()).filter((entry: CanDIEntry) => {
      return entry.deps.includes(key);
    });
  }

  /**
   * This changes any comp values that depend on the changed value.
   * there may be downstream comps that depend on other comps;
   * to prevent wear and tear on the event loop, these downstream changes
   * are either pushed to pq or used to immediately update the map.
   *
   * This can cause a cascade loop; to prevent infinite cycling,
   * there is a maximum number of loop iterations that can happen in this method;
   * once that threshold is met,
   * the while loop exits and an error message is emitted.
   * However, the values are allowed to update to the value of the CanDI instance.
   *
   * This is to prevent circular loops from triggering each other
   * in an infinite loop.
   *
   * In a typical arrangement, nearly all comps will be driven by values,
   * not other comps, so you will only have one while loop --
   * none of the entries will push anything into changedKeys,
   * so you will just blow through all the downstream comps once and exit.
   *
   */
  private _updateComps(key: Key, map: ValueMap) {
    const changedKeys: Key[] = [key];
    let loops = 0;
    while (changedKeys.length > 0 && loops < this.maxChangeLoops) {
      ++loops;

      const key = changedKeys.shift();
      const dependants = this.entriesDepOn(key);
      dependants.forEach((entry) => {
        const entryKey = entry.key;
        if (entry.deps.includes(key) && entry.type === 'comp' && entry.active && entry.resolved(map)) {
          const updatedValue = entry.computeFor(map);
          if (entry.async) {
            this.pq.set(entryKey, updatedValue);
            // the _onValue from the promise will eventually resolve and trigger an update cycle of its own
          } else if (map.has(entryKey)) {
            if (map.get(entryKey) !== updatedValue) {
              map.set(key, updatedValue);

              if (this.entriesDepOn(entryKey).length) {
                changedKeys.push(entryKey);
              } // if no other comps are driven by the value of this entry, no reason to give it a while loop cycle,

            } // else -- the value of changed entry is already the same - no need to cascade compute derived comps
          } else {
            map.set(key, updatedValue);
            changedKeys.push(entryKey);
          }

          /**
           * at this point either
           *     --- (async) --- a new async value has been pushed into pq and will ultimately trigger its own cycle later
           * or  --- (sync) ---  the map has been updated with a new recomputed value from the entry (sync)
           *                     AND its key as been pushed onto changed keys
           *                     so we can see if there are any downstream comps which depend on it.
           */
        }
      });

      if (changedKeys.length) {
        console.error('too many triggered changes for changing ', key, changedKeys);
      }
    }

  }
}
