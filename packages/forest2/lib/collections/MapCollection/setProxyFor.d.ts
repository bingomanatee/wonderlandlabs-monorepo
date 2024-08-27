export type MapSetInfo<KeyType, ValueType> = {
    map: Map<KeyType, ValueType>;
    key: KeyType;
    value: ValueType;
};
export declare function setProxyFor<KeyType = unknown, ValueType = unknown>(target: MapSetInfo<KeyType, ValueType>): Map<KeyType, ValueType>;
