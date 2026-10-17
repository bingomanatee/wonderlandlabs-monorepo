import useObserveForest from './useObserveForest.js';
export default function useForestryGlobal(source, filter) {
    const store = source.singleton;
    const value = useObserveForest(store, filter);
    return [value, store];
}
