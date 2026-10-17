import { prepareCollectionEntry } from './collection.validation.js';
export function collectionItemEntries(items, validation) {
    if (items instanceof Map) {
        return Array.from(items, ([key, item]) => prepareCollectionEntry(key, item, validation));
    }
    return Array.from(items, (item) => {
        const parsed = validation.parseItem(item);
        const key = validation.keyOf(parsed);
        return [key, parsed];
    });
}
export function storeCollectionEntry(value, entry, trackChange) {
    const [id, item] = entry;
    const exists = value.records.has(id);
    value.records.set(id, item);
    if (trackChange) {
        value.changed.add(id);
        if (!exists) {
            value.created.add(id);
        }
    }
}
