import { CollectionBase } from './CollectionBase.js'
import type {
  SchemaCollectionConfig,
  SchemaCollectionClass,
  CollectionKey,
  IdentityProperty,
  ModelIdentity,
  ModelShape,
  z,
  RecordUtilities,
  CollectionUtilities,
  CollectionMethodsConfig,
} from './types.js'

export function defineCollection<
  Shape extends ModelShape,
  Identity extends IdentityProperty<
    z.output<z.ZodObject<Shape>>,
    CollectionKey
  >,
  Utilities extends RecordUtilities<
    z.output<z.ZodObject<Shape>>,
    ModelIdentity<z.ZodObject<Shape>, Identity>
  > = {},
  Collections extends CollectionUtilities<
    z.output<z.ZodObject<Shape>>,
    ModelIdentity<z.ZodObject<Shape>, Identity>
  > = {},
>(
  schema: z.ZodObject<Shape>,
  identity: Identity,
  methods: CollectionMethodsConfig<
    z.output<z.ZodObject<Shape>>,
    ModelIdentity<z.ZodObject<Shape>, Identity>,
    Utilities,
    Collections
  > = {},
): SchemaCollectionClass<z.ZodObject<Shape>, Identity, Utilities, Collections> {
  const config: SchemaCollectionConfig<
    z.ZodObject<Shape>,
    Identity,
    Utilities,
    Collections
  > = {
    schema,
    identity,
    ...methods,
  }

  return class ModelCollection extends CollectionBase<
    z.output<z.ZodObject<Shape>>,
    ModelIdentity<z.ZodObject<Shape>, Identity>,
    Utilities,
    Collections
  > {
    constructor(params: unknown) {
      super(params, config)
    }
  }
}
