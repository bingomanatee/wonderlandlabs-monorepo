import { BranchIF, DoMethod, LeafConfig, LeafIF, SubscribeListener } from './types';
export default class Leaf implements LeafIF {
    branch: BranchIF;
    config: LeafConfig;
    name: string;
    constructor(branch: BranchIF, config: LeafConfig, name: string);
    get forest(): import("./types").ForestIF;
    get value(): unknown;
    set value(value: unknown);
    validate(): void;
    get observable(): import("rxjs").Observable<unknown>;
    subscribe(listener: SubscribeListener): import("rxjs").Subscription;
    report(): {
        type: string;
        value: unknown;
        name: string;
        parent: string;
    };
    do: Record<string, DoMethod>;
    private _initDo;
}
