import type { CollectionBaseValue, CollectionKey, ItemKey, DataManagerValue, ModelSocketState } from './types.js';
export declare function createEmptyModelSocketState(): ModelSocketState;
export declare function createCollectionValue<Item, Key extends CollectionKey = ItemKey<Item>>(): CollectionBaseValue<Item, Key>;
export declare function createDataManagerValue(): DataManagerValue;
//# sourceMappingURL=factories.d.ts.map