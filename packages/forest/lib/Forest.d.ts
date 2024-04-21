import { BranchConfig, BranchIF, ForestIF, ForestItemIF, TransFn, TransIF } from './types';
export default class Forest implements ForestIF {
    items: Map<string, ForestItemIF>;
    register(item: ForestItemIF): void;
    createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;
    pending: TransIF[];
    trans(name: string, fn: TransFn): void;
    removeTrans(trans: TransIF): void;
    commit(): void;
}
