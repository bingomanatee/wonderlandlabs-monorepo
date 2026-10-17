import { BehaviorSubject, Subject } from 'rxjs';
import type { DataConnection, JsonFixtureRecords, ModelSocketState } from './types.js';
export declare class JsonFixtureConnection implements DataConnection {
    readonly changes$: Subject<unknown>;
    readonly state$: BehaviorSubject<ModelSocketState>;
    private readonly fixtures;
    constructor(fixtures: JsonFixtureRecords);
    ensureReady(): Promise<void>;
    delete<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    get<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    put<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    start(): void;
    stop(): void;
}
//# sourceMappingURL=JsonFixtureConnection.d.ts.map