import type { CollectionBaseValue, CollectionKey, ItemKey, DataManagerValue, ConnectionState } from './types.js';
export declare function createEmptyConnectionState(): ConnectionState;
export declare function createCollectionValue<Item, Key extends CollectionKey = ItemKey<Item>>(): CollectionBaseValue<Item, Key>;
export declare function createDataManagerValue(): DataManagerValue;
//# sourceMappingURL=factories.d.ts.map