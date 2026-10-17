import { defineCollection } from '../defineCollection.js'
import { DataManager } from '../DataManager.js'
import { brandedModelSchema, numericModelSchema } from './schemas.js'
import type { BrandedRecord } from './types.js'

const NumericCollection = defineCollection(numericModelSchema, 'identity')
const BrandedCollection = defineCollection(brandedModelSchema, 'id')
declare const numeric: InstanceType<typeof NumericCollection>
declare const branded: InstanceType<typeof BrandedCollection>
declare const brandedId: BrandedRecord['id']

numeric.getItem(0)
numeric.has(1)
numeric.delete(1)
numeric.put(1, { identity: 1, label: 'One' })
branded.getItem(brandedId)

// @ts-expect-error Numeric identities reject string keys.
numeric.getItem('1')
// @ts-expect-error Numeric identities reject string keys for writes.
numeric.put('1', { identity: 1, label: 'One' })
// @ts-expect-error Numeric identities reject string keys for deletes.
numeric.delete('1')
// @ts-expect-error Branded identities reject unvalidated strings.
branded.getItem('one')
// @ts-expect-error Model schemas must contain the identity property.
defineCollection(numericModelSchema, 'missing')

const manager = new DataManager()
const registered = manager.addModel('numeric', NumericCollection)
registered.getItem(1)
// @ts-expect-error Registered collections retain numeric identities.
registered.getItem('1')

// @ts-expect-error Starter map keys must match the model identity type.
manager.addModel(
  'bad',
  NumericCollection,
  new Map([['1', { identity: 1, label: 'One' }]]),
)

const CustomCollection = defineCollection(numericModelSchema, 'identity', {
  recordMethods: {
    rename: (id, config: { label: string } | undefined, collection) => {
      if (config) collection.update(id, config)
      return collection.getItem(id)
    },
  },
})
const custom = manager.addModel('custom', CustomCollection)
custom.recordMethods.rename(0, { label: 'Zero' })
custom.recordMethods.rename(0)
// @ts-expect-error Custom utility identities retain the model key type.
custom.recordMethods.rename('0')
// @ts-expect-error Custom utility config retains its declared shape.
custom.recordMethods.rename(0, { label: 1 })
// @ts-expect-error Utilities must be explicitly supplied.
custom.recordMethods.unknown(0)

const WithCollectionMethods = defineCollection(numericModelSchema, 'identity', {
  collectionMethods: {
    labels: (config: { prefix: string } | undefined, collection) =>
      collection.list().map((item) => `${config?.prefix ?? ''}${item.label}`),
  },
})
const withMethods = manager.addModel('withMethods', WithCollectionMethods)
withMethods.collectionMethods.labels()
withMethods.collectionMethods.labels({ prefix: 'Label: ' })
// @ts-expect-error Collection utility config is typed and does not take an id.
withMethods.collectionMethods.labels(1)
// @ts-expect-error Incorrect config property type.
withMethods.collectionMethods.labels({ prefix: 1 })
// @ts-expect-error Only supplied collection methods are exposed.
withMethods.collectionMethods.missing()
