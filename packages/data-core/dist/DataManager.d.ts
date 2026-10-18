import { Forest } from '@wonderlandlabs/forestry4';
import type { CollectionBase, CollectionConstructor, InitialCollectionData, ValidCollectionClass, CollectionBaseValue, CollectionKey, ItemKey, DataCollectionClass, DataConnector, DataManagerConfig, DataManagerValue } from './types.js';
export declare class DataManager<ValueType extends DataManagerValue = DataManagerValue, Change = unknown> extends Forest<ValueType> {
    readonly connector: DataConnector<Change> | null;
    constructor(config?: DataManagerConfig<ValueType, Change>);
    get collections(): Map<string, CollectionBaseValue<unknown, CollectionKey>>;
    addModel<KeyType extends CollectionKey, RecordType, BranchType extends CollectionBase<RecordType, KeyType> = CollectionBase<RecordType, KeyType>>(name: string, branchClass: DataCollectionClass<KeyType, RecordType, BranchType>, initialData?: Map<KeyType, RecordType>): BranchType;
    addModel<Branch extends CollectionConstructor>(name: string, branchClass: Branch & ValidCollectionClass<Branch>, initialData?: InitialCollectionData<Branch>): InstanceType<Branch>;
    collection<RecordType, Key extends CollectionKey = ItemKey<RecordType>>(name: string): CollectionBase<RecordType, Key, {}, {}> | undefined;
}
//# sourceMappingURL=DataManager.d.ts.map