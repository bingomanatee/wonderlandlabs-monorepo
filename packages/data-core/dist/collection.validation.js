import { dataCoreDefaults, dataCoreErrors } from './constants.js';
export function parseCollectionKey(key) {
    if (typeof key !== 'string' &&
        !(typeof key === 'number' && Number.isFinite(key))) {
        throw new Error(dataCoreErrors.invalidIdentity);
    }
    return key;
}
export function createCollectionValidation(config) {
    const { schema } = config;
    const identity = config.identity ?? dataCoreDefaults.identity;
    const keySchema = schema?.shape[identity];
    if (schema && config.keyOf) {
        throw new Error(dataCoreErrors.schemaKeyOf);
    }
    if (schema && !keySchema) {
        throw new Error(dataCoreErrors.missingIdentity);
    }
    return {
        checkIdentity: Boolean(schema),
        keyOf: (item) => parseCollectionKey(config.keyOf ? config.keyOf(item) : Reflect.get(Object(item), identity)),
        parseItem: (item) => (schema ? schema.parse(item) : item),
        parseKey: (key) => parseCollectionKey(keySchema ? keySchema.parse(key) : key),
    };
}
export function prepareCollectionEntry(key, item, validation) {
    const parsedKey = validation.parseKey(key);
    const parsedItem = validation.parseItem(item);
    if (validation.checkIdentity && validation.keyOf(parsedItem) !== parsedKey) {
        throw new Error(dataCoreErrors.mismatchedIdentity);
    }
    return [parsedKey, parsedItem];
}
