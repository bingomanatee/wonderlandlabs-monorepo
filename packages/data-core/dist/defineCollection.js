import { CollectionBase } from './CollectionBase.js';
export function defineCollection(schema, identity, methods = {}) {
    const config = {
        schema,
        identity,
        ...methods,
    };
    return class ModelCollection extends CollectionBase {
        constructor(params) {
            super(params, config);
        }
    };
}
