import type { Forest } from '@wonderlandlabs/forestry4'
import useObserveForest from './useObserveForest.js'

export interface ForestryGlobalSource<StoreType extends Forest<any>> {
  readonly singleton: StoreType
}

type ForestryGlobalValue<StoreType> =
  StoreType extends Forest<infer ValueType> ? ValueType : never

export default function useForestryGlobal<
  StoreType extends Forest<any>,
  OutputType = ForestryGlobalValue<StoreType>,
>(
  source: ForestryGlobalSource<StoreType>,
  filter?: (value: ForestryGlobalValue<StoreType>) => OutputType,
): [OutputType, StoreType] {
  const store = source.singleton
  const value = useObserveForest<ForestryGlobalValue<StoreType>, OutputType>(
    store,
    filter,
  )

  return [value, store]
}
