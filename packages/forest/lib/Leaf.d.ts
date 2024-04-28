import { BranchIF, DoMethod, LeafConfig, LeafIF, SubscribeListener } from './types';
import { Subscription } from 'rxjs';
export default class Leaf implements LeafIF {
    branch: BranchIF;
    constructor(branch: BranchIF, config: LeafConfig | string, name: string);
    get forest(): import("./types").ForestIF;
    name: string;
    config: LeafConfig;
    get value(): unknown;
    set value(value: unknown);
    validate(): void;
    get observable(): import("rxjs").Observable<unknown>;
    subscribe(listener: SubscribeListener): Subscription;
    report(): {
        type: string;
        value: unknown;
        name: string;
        parent: string;
    };
    do: Record<string, DoMethod>;
    _initDo(): void;
}
