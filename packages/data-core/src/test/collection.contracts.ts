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

numeric.find({ label: 'One' })
numeric.find([0, 1] as const)
numeric.find((item) => item.identity > 0, (a, b) =>
  a.label.localeCompare(b.label),
)
branded.find([brandedId])
// @ts-expect-error Query IDs retain the collection identity type.
numeric.find(['one'])
// @ts-expect-error Example fields retain their record types.
numeric.find({ identity: 'one' })
// @ts-expect-error Query examples reject unknown fields.
numeric.find({ missing: true })
// @ts-expect-error Branded query keys require validated strings.
branded.find(['one'])

numeric.cleanCollection({ label: 'One' })
numeric.cleanCollection([0, 1] as const)
numeric.cleanCollection((item) => item.identity > 0)
numeric.cleanAll()
branded.cleanCollection([brandedId])
// @ts-expect-error Cleanup IDs retain the collection identity type.
numeric.cleanCollection(['one'])
// @ts-expect-error Cleanup examples retain their field types.
numeric.cleanCollection({ identity: 'one' })
// @ts-expect-error Branded cleanup keys require validated strings.
branded.cleanCollection(['one'])

numeric.delete({ label: 'One' })
numeric.delete([0, 1] as const)
numeric.delete((item) => item.identity > 0)
branded.delete([brandedId])
// @ts-expect-error Delete query IDs retain the identity type.
numeric.delete(['one'])
// @ts-expect-error Delete examples retain their field types.
numeric.delete({ identity: 'one' })
// @ts-expect-error Branded delete query keys require validated strings.
branded.delete(['one'])

numeric.persist({
  ids: [0, 1] as const,
  sendRecords: async (records) => records.get(0)?.identity === 0,
})
// @ts-expect-error Persist IDs retain the collection key type.
numeric.persist({ ids: ['one'], sendRecords: async () => true })
// @ts-expect-error Persistence callbacks return Promise<boolean>.
numeric.persist({ sendRecords: async () => 'saved' })

// Tracking is inspection-only; changes belong to collection commands.
// @ts-expect-error Tracking sets do not expose mutators.
numeric.value.changed.add(1)
// @ts-expect-error Tracking sets do not expose mutators.
numeric.value.created.clear()
// @ts-expect-error Tracking properties cannot be replaced.
numeric.value.changed = new Set<number>()
// @ts-expect-error Direct tracking reset is not a collection command.
numeric.clearTracking()

numeric.abortPending()
numeric.abortPending([1])
// @ts-expect-error Abort IDs retain numeric identities.
numeric.abortPending(['one'])
const request = numeric.persistWork$.value[0]
// @ts-expect-error Request state is inspection-only.
request.state = 'pending'
// @ts-expect-error Request timestamps are inspection-only.
request.createdAt = 0
// @ts-expect-error The unsafe abort API has been removed.
numeric.abortPersist([1])
