import { BehaviorSubject, distinctUntilChanged, filter, first, map, Subject, Subscription } from 'rxjs'
import {
  Config,
  GenFunction, isEventError,
  isEventInit,
  isEventValue, isPromiseQueueMessage,
  Key,
  ResDef,
  ResEvent,
  ResourceType,
  Value,
  ValueMap
} from './types'
import { PromiseQueue } from './PromiseQueue'
import CanDIEntry from './CanDIEntry'
import { ce } from './utils'
import isEqual from 'lodash.isequal'

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

  when(deps: Key | Key[], once = true) {
    if (!deps) {
      throw new Error('when requires non-empty criteria');
    }
    const fr = filter((vm: ValueMap) => {
      if (Array.isArray(deps)) {
        return deps.every((key) => vm.has(key));
      }
      return vm.has(deps);
    });
    const mp = map((vm: ValueMap) => {
      if (Array.isArray(deps)) {
        return deps.map((key) => vm.get(key));
      }
      return vm.get(deps);
    });

    if (once) {
      return this.values.pipe(fr, mp, distinctUntilChanged(isEqual), first())
    }
    return this.values.pipe(fr, mp, distinctUntilChanged(isEqual));
  }

  /**
   * this is an "old school" async function that returns a promise.
   * @param deps
   */
  getAsync(deps: Key|Key[]) {
    return new Promise((done, fail) => {
      let sub: Subscription | undefined = undefined;
      sub = this.when(deps)
        .subscribe({
          next(value) {
            done(value);
            sub?.unsubscribe();
          },
          error(err) {
            fail(err);
          }
        })
    })
  }

  // --------------- event management -------------
  private _eventSubs: Subscription[] = [];

  public complete() {
    this._eventSubs.forEach(sub => sub.unsubscribe())
  }

  private _pqSub?: Subscription;

  private _initPQ() {
    const self = this;
    this._pqSub = this.pq.events.subscribe((eventOrError) => {
      if (isPromiseQueueMessage(eventOrError)) {
        const {key, value} = eventOrError;
        self._onValue(key, value);
      } else {
        const {key, error} = eventOrError;
        self.events.next({target: key, type: 'async-error', value: error})
      }
    })
  }

  private _initEvents() {
    const self = this;
    this._eventSubs
      .push(
        this.events
          .pipe(
            filter(isEventValue)
          )
          .subscribe({
            next: (event) => self._onValue(event.target, event.value),
            error: (err) => console.error('error on value event:', err)
          })
      )

    this._eventSubs
      .push(
        this.events.pipe(
          filter(isEventError)
        )
          .subscribe({
            next(event) {
              self._onAsyncError(event.target, event.value);
            },
            error(e) {
              ce('error on async error', e);
            }
          })
      );

    this._eventSubs
      .push(
        this.events
          .pipe(
            filter(isEventInit)
          )
          .subscribe(
            {
              next: (event) => self._onInit(event.target, event.value),
              error: (err) => ce('error on init event:', err)
            }
          )
      )
  }

  _onAsyncError(key: Key, error: any) {
    ce('async error thrown for ', key, error);
  }

  _onInit(key: Key, data: ResDef) {
    if (this.entries.has(key)) {
      ce('key', key, 'initialized twice');
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

    const entry = new CanDIEntry(
      this,
      key,
      myConfig!,
      value
    )

    entry.checkForLoop();

    this.entries.set(
      key,
      entry
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
    // console.log(' ---------- _updateComps for ', key, 'with map', map);
    while (changedKeys.length > 0 && loops < this.maxChangeLoops) {
      ++loops;

      const key = changedKeys.shift();
      // console.log('loop ', loops, 'processing ', key, 'from changedKeys', changedKeys, 'map is ', map);
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
              map.set(entryKey, updatedValue);

              if (this.entriesDepOn(entryKey).length) {
                changedKeys.push(entryKey);
              } // if no other comps are driven by the value of this entry, no reason to give it a while loop cycle,

            } // else -- the value of changed entry is already the same - no need to cascade compute derived comps
          } else {
            // initial set of new computed value
            map.set(entryKey, updatedValue);
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

    }
    if (changedKeys.length) {
      ce('too many triggered changes for changing ', key, changedKeys);
    }
  }
}
