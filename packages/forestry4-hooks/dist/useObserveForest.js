import { useEffect, useMemo, useRef, useState } from 'react';
export default function useObserveForest(store, filter) {
    const select = useMemo(() => filter ?? ((value) => value), [filter]);
    const [value, setValue] = useState(() => select(store.value));
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);
    useEffect(() => {
        const current = select(store.value);
        if (!selectionEqual(valueRef.current, current)) {
            valueRef.current = current;
            setValue(current);
        }
        const sub = store.subscribe((nextValue) => {
            const selected = select(nextValue);
            if (selectionEqual(valueRef.current, selected)) {
                return;
            }
            valueRef.current = selected;
            setValue(selected);
        });
        return () => {
            sub?.unsubscribe();
        };
    }, [select, store]);
    return value;
}
function selectionEqual(left, right) {
    if (Object.is(left, right)) {
        return true;
    }
    if (!isShallowRecord(left) || !isShallowRecord(right)) {
        return false;
    }
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) {
        return false;
    }
    return leftKeys.every((key) => Object.is(left[key], right[key]));
}
function isShallowRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
