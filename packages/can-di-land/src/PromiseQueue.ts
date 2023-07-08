import { Subject } from 'rxjs'
import { isPromise, PromiseQueueEvent, ResourceKey } from './types'

/**
 * This class keeps a list of pending promises and emitts a key-value pair when a promise completes.
 * The catch is -- if a new promise is enqueued before an old promise completes,
 * the prior promise's value is ignored. This follows the "debounce" pattern.
 */
export class PromiseQueue {
  private promises: Map<ResourceKey, Subject<any>> = new Map();

  set(key: ResourceKey, promise: Promise<any>) {
    if (!isPromise(promise)) {
      promise = Promise.resolve(promise);
    }
    this.promises.get(key)?.complete();
    const subject = this._asSubject(key, promise);
    this.promises.set(key, subject);

    return this;
  }

  public events = new Subject<PromiseQueueEvent>();

  private _asSubject(key: ResourceKey, promise: Promise<any>) {
    const self = this;
    const subject = new Subject();
    promise.then((value) => {
      if (!subject.closed) {
        subject.next(value);
      }
    }).catch((err) => {
      console.error('error in PromiseQueue: ', key, err);
    })
    subject.subscribe({
      error(err) {
        console.warn('error on PromiseQueue:', key, err);
      },
      next(value) {
        self.events.next({ key, value })
      }
    });

    return subject;
  }
}
