import { Observable, Subject } from 'rxjs';
import { ResConfig, Resource, ResourceKey, ResourceType } from './types';
type ResDef = {
    name: ResourceKey;
    value: any;
    config?: ResConfig;
    type?: ResourceType;
};
/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
export declare class CanDI {
    registry: Map<any, Resource>;
    loadStream: Subject<any>;
    constructor(values?: ResDef[]);
    set(name: ResourceKey, resource: any, config?: ResConfig | ResourceType): CanDI;
    /**
     * returns the value of the resource(s); note, this is an async method.
     * @param name
     * @param time
     */
    get(name: ResourceKey | ResourceKey[], time?: number): Promise<any>;
    /**
     * this is a synchronous retrieval function. it returns the value
     * of the resource IF it has been set, AND its dependencies have been resolved.
     *
     * @param name
     */
    value(name: ResourceKey | ResourceKey[]): any;
    has(name: ResourceKey | ResourceKey[]): boolean;
    when(deps: ResourceKey | ResourceKey[], maxTime?: number): Observable<any>;
    observe(name: string | string[]): Observable<any[]>;
}
export {};
