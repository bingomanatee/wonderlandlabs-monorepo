import { BehaviorSubject, Subject } from 'rxjs';
import { Config, Key, ResDef, ResEvent, ResourceType, Value, ValueMap } from './types';
import { PromiseQueue } from './PromiseQueue';
import CanDIEntry from './CanDIEntry';
export declare class CanDI {
    constructor(values?: ResDef[], maxChangeLoops?: number);
    private maxChangeLoops;
    values: BehaviorSubject<ValueMap>;
    entries: Map<any, CanDIEntry>;
    events: Subject<ResEvent>;
    pq: PromiseQueue;
    set(key: Key, value: Value): void;
    add(key: Key, value: Value, config?: Config | ResourceType): void;
    get(key: Key): Value | undefined;
    gets(keys: Key[]): Value | undefined;
    has(key: Key | Key[]): boolean;
    entry(key: Key): CanDIEntry | undefined;
    private _eventSubs;
    complete(): void;
    private _pqSub?;
    private _initPQ;
    private _initEvents;
    _onInit(key: Key, data: ResDef): void;
    private _onValue;
    entriesDepOn(key: Key): CanDIEntry[];
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
    private _updateComps;
}
