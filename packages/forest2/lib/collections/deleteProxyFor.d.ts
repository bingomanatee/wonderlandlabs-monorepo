export type MapDeleteInfo<KeyType, ValueType> = {
    map: Map<KeyType, ValueType>;
    keys: KeyType[];
};
export declare function deleteProxyFor<KeyType, ValueType>(target: MapDeleteInfo<KeyType, ValueType>): Map<KeyType, ValueType>;
