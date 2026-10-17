import { BehaviorSubject } from 'rxjs';
import type { DataConnection, ModelSocketState, Observable } from './types.js';
export declare class DataConnectionManager<Change = unknown> {
    #private;
    readonly changes$: Observable<Change>;
    readonly state$: BehaviorSubject<ModelSocketState>;
    constructor(connections: DataConnection<Change>[]);
    start(): void;
    stop(): void;
    delete<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    get<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    put<Data = unknown>(modelName: string, input?: unknown): Promise<Data>;
    private tryConnections;
}
//# sourceMappingURL=DataConnectionManager.d.ts.map