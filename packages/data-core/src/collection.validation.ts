import { dataCoreDefaults, dataCoreErrors } from './constants.js'
import type {
  CollectionBaseConfig,
  CollectionKey,
  CollectionValidation,
} from './types.js'

export function parseCollectionKey(key: unknown): CollectionKey {
  if (
    typeof key !== 'string' &&
    !(typeof key === 'number' && Number.isFinite(key))
  ) {
    throw new Error(dataCoreErrors.invalidIdentity)
  }

  return key
}

export function createCollectionValidation<Item, Key extends CollectionKey>(
  config: CollectionBaseConfig<Item, Key>,
): CollectionValidation<Item, Key> {
  const { schema } = config
  const identity = config.identity ?? dataCoreDefaults.identity
  const keySchema = schema?.shape[identity as string]

  if (schema && config.keyOf) {
    throw new Error(dataCoreErrors.schemaKeyOf)
  }

  if (schema && !keySchema) {
    throw new Error(dataCoreErrors.missingIdentity)
  }

  return {
    checkIdentity: Boolean(schema),
    keyOf: (item) =>
      parseCollectionKey(
        config.keyOf ? config.keyOf(item) : Reflect.get(Object(item), identity),
      ) as Key,
    parseItem: (item) => (schema ? schema.parse(item) : item),
    parseKey: (key) =>
      parseCollectionKey(keySchema ? keySchema.parse(key) : key) as Key,
  }
}

export function prepareCollectionEntry<Item, Key extends CollectionKey>(
  key: Key,
  item: Item,
  validation: CollectionValidation<Item, Key>,
): readonly [Key, Item] {
  const parsedKey = validation.parseKey(key)
  const parsedItem = validation.parseItem(item)

  if (validation.checkIdentity && validation.keyOf(parsedItem) !== parsedKey) {
    throw new Error(dataCoreErrors.mismatchedIdentity)
  }

  return [parsedKey, parsedItem]
}
