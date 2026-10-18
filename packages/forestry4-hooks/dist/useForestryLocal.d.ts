export interface ForestryLocalStore<ValueType> {
    complete: () => void;
    subscribe: (next: (nextValue: ValueType) => void) => {
        unsubscribe?: () => void;
    };
    value: ValueType;
}
export default function useForestryLocal<ValueType, StoreType extends ForestryLocalStore<ValueType>, Args extends unknown[] = []>(factory: (...args: Args) => StoreType, ...rest: Args): [ValueType, StoreType];
//# sourceMappingURL=useForestryLocal.d.ts.map