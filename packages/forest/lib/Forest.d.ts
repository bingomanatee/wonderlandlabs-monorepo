import { BranchConfig, BranchIF, ForestId, ForestIF, ForestItemTransactionalIF, TransFn, TransIF } from './types';
export default class Forest implements ForestIF {
    items: Map<ForestId, ForestItemTransactionalIF>;
    register(item: ForestItemTransactionalIF): void;
    createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;
    pending: TransIF[];
    trans(name: string, fn: TransFn): void;
    removeTrans(trans: TransIF): void;
    commit(): void;
}
