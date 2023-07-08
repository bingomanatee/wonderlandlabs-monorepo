import { Subject } from 'rxjs';
import { PromiseQueueEvent, ResourceKey } from './types';
/**
 * This class keeps a list of pending promises and emitts a key-value pair when a promise completes.
 * The catch is -- if a new promise is enqueued before an old promise completes,
 * the prior promise's value is ignored. This follows the "debounce" pattern.
 */
export declare class PromiseQueue {
    private promises;
    set(key: ResourceKey, promise: Promise<any>): this;
    events: Subject<PromiseQueueEvent>;
    private _asSubject;
}
