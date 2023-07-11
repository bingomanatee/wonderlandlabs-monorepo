import { BehaviorSubject, Subject } from 'rxjs';
import { Config, Key, ResDef, ResEvent, ResourceType, Value, ValueMap } from './types';
import { PromiseQueue } from './PromiseQueue';
import CanDIEntry from './CanDIEntry';
export declare class CanDI {
    constructor(values?: ResDef[]);
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
}
