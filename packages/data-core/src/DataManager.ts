import { Forest } from '@wonderlandlabs/forestry4'
import type {
  CollectionBase,
  CollectionConstructor,
  InitialCollectionData,
  ValidCollectionClass,
  CollectionBaseValue,
  CollectionKey,
  ItemKey,
  DataCollectionClass,
  DataConnector,
  DataManagerConfig,
  DataManagerValue,
} from './types.js'
import { createCollectionValue, createDataManagerValue } from './factories.js'
import { DataConnectionManager } from './DataConnectionManager.js'
import { dataCoreDefaults, dataCoreErrors } from './constants.js'

export class DataManager<
  ValueType extends DataManagerValue = DataManagerValue,
  Change = unknown,
> extends Forest<ValueType> {
  readonly connector: DataConnector<Change> | null

  constructor(config: DataManagerConfig<ValueType, Change> = {}) {
    super({
      name: config.name ?? dataCoreDefaults.managerName,
      value: config.value ?? (createDataManagerValue() as ValueType),
    })
    this.connector =
      config.connector ??
      (config.connections
        ? new DataConnectionManager<Change>(config.connections)
        : null)
  }

  get collections() {
    return this.value.collections
  }

  addModel<
    KeyType extends CollectionKey,
    RecordType,
    BranchType extends CollectionBase<RecordType, KeyType> = CollectionBase<
      RecordType,
      KeyType
    >,
  >(
    name: string,
    branchClass: DataCollectionClass<KeyType, RecordType, BranchType>,
    initialData?: Map<KeyType, RecordType>,
  ): BranchType
  addModel<Branch extends CollectionConstructor>(
    name: string,
    branchClass: Branch & ValidCollectionClass<Branch>,
    initialData?: InitialCollectionData<Branch>,
  ): InstanceType<Branch>
  addModel<
    KeyType extends CollectionKey,
    RecordType,
    BranchType extends CollectionBase<RecordType, KeyType> = CollectionBase<
      RecordType,
      KeyType
    >,
  >(
    name: string,
    branchClass: DataCollectionClass<KeyType, RecordType, BranchType>,
    initialData: Map<KeyType, RecordType> = new Map(),
  ) {
    if (this.value.collections.has(name)) {
      throw new Error(dataCoreErrors.duplicateCollection(name))
    }

    this.mutate((draft) => {
      draft.collections.set(
        name,
        createCollectionValue<RecordType, KeyType>() as CollectionBaseValue<
          unknown,
          CollectionKey
        >,
      )
    })

    try {
      const branch = this.$branches.$add<
        CollectionBaseValue<RecordType, KeyType>,
        BranchType
      >(['collections', name], {
        name,
        subclass: branchClass,
      })

      branch.putMany(initialData, false)
      return branch
    } catch (error) {
      this.$branches.$get(['collections', name])?.complete()
      this.$branches.delete(['collections', name])
      this.mutate((draft) => {
        draft.collections.delete(name)
      })
      throw error
    }
  }

  collection<RecordType, Key extends CollectionKey = ItemKey<RecordType>>(
    name: string,
  ) {
    return this.$branches.$get<
      CollectionBaseValue<RecordType, Key>,
      CollectionBase<RecordType, Key>
    >(['collections', name])
  }
}
