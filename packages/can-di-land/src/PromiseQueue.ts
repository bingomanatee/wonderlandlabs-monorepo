import { Subject } from "rxjs";
import { isPromise, PromiseQueueEvent, Key } from "./types";
import { ce } from "./utils";

/**
 * This class keeps a list of pending promises and emitts a key-value pair when a promise completes.
 * The catch is -- if a new promise is enqueued before an old promise completes,
 * the prior promise's value is ignored. This follows the "debounce" pattern.
 */
export class PromiseQueue {
  private promises: Map<Key, Subject<any>> = new Map();

  set(key: Key, promise: Promise<any>) {
    if (!isPromise(promise)) {
      promise = Promise.resolve(promise);
    }
    this.promises.get(key)?.complete();
    const subject = this._asSubject(key, promise);
    this.promises.set(key, subject);
    return this;
  }

  has(key: Key) {
    return this.promises.has(key);
  }

  public events = new Subject<PromiseQueueEvent>();

  private _asSubject(key: Key, promise: Promise<any>) {
    const self = this;
    const subject = new Subject();
    promise
      .then((value) => {
        if (!subject.closed) {
          subject.next(value);
        }
      })
      .catch((err) => {
        ce("error in PromiseQueue: ", key, err);
        self.events.next({ key, error: err });
      });
    subject.subscribe({
      error(err) {
        // should never happen
        ce("error on PromiseQueue:", key, err);
      },
      next(value) {
        self.events.next({ key, value });
      },
    });

    return subject;
  }
}
