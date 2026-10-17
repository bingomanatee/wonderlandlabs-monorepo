export function bindCollectionUtilities(collection, utilities) {
    return Object.freeze(Object.fromEntries(Object.entries(utilities).map(([name, utility]) => [
        name,
        (config) => utility(config, collection),
    ])));
}
