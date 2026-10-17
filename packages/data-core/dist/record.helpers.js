export function bindRecordUtilities(collection, utilities, parseKey) {
    return Object.freeze(Object.fromEntries(Object.entries(utilities).map(([name, utility]) => [
        name,
        (id, config) => utility(parseKey(id), config, collection),
    ])));
}
