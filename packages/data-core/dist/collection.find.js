function isKeyList(query) {
    return Array.isArray(query);
}
export function findCollectionEntries(records, query, parseKey) {
    if (isKeyList(query)) {
        const keys = query.map(parseKey);
        return keys
            .filter((key) => records.has(key))
            .map((key) => [key, records.get(key)]);
    }
    const entries = Array.from(records.entries());
    if (typeof query === 'function') {
        return entries.filter(([, item]) => query(item));
    }
    const fields = Reflect.ownKeys(query);
    return entries.filter(([, item]) => fields.every((field) => Object.is(Reflect.get(Object(item), field), Reflect.get(query, field))));
}
export function findCollectionItems(records, query, parseKey, sortFn) {
    const result = findCollectionEntries(records, query, parseKey)
        .map(([, item]) => item);
    return sortFn ? result.sort(sortFn) : result;
}
