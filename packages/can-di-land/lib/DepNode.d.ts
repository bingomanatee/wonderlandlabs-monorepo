import { ResConfig, ResourceKey } from './types';
type CanDiType = {
    configs: Map<ResourceKey, ResConfig>;
};
export declare class DepNode {
    key: ResourceKey;
    can: CanDiType;
    parent?: DepNode | undefined;
    constructor(key: ResourceKey, can: CanDiType, parent?: DepNode | undefined);
    get deps(): DepNode[];
    get parents(): ResourceKey[];
    get errors(): Error[];
}
export {};
