import { Forest } from '@wonderlandlabs/forestry4';
import { collectionItemEntries, storeCollectionEntry, } from './collection.helpers.js';
import { createCollectionValidation, prepareCollectionEntry, } from './collection.validation.js';
import { bindCollectionUtilities } from './collection.utilities.js';
import { bindRecordUtilities } from './record.helpers.js';
import { dataCoreErrors } from './constants.js';
export class CollectionBase extends Forest {
    collectionMethods;
    recordMethods;
    keyOf;
    validation;
    constructor(params, config = {}) {
        super(params);
        this.validation = createCollectionValidation(config);
        this.keyOf = this.validation.keyOf;
        this.collectionMethods = bindCollectionUtilities(this, config.collectionMethods ?? {});
        this.recordMethods = bindRecordUtilities(this, config.recordMethods ?? {}, this.validation.parseKey);
    }
    getItem(id) {
        return this.value.records.get(this.validation.parseKey(id));
    }
    has(id) {
        return this.value.records.has(this.validation.parseKey(id));
    }
    list() {
        return Array.from(this.value.records.values());
    }
    setItem(item, trackChange = true) {
        const [entry] = collectionItemEntries([item], this.validation);
        this.mutate((draft) => storeCollectionEntry(draft, entry, trackChange));
    }
    put(id, item, trackChange = true) {
        const entry = prepareCollectionEntry(id, item, this.validation);
        this.mutate((draft) => storeCollectionEntry(draft, entry, trackChange));
    }
    setMany(items, trackChange = false) {
        this.putMany(items, trackChange);
    }
    putMany(items, trackChange = false) {
        const entries = collectionItemEntries(items, this.validation);
        this.mutate((draft) => {
            for (const entry of entries) {
                storeCollectionEntry(draft, entry, trackChange);
            }
        });
    }
    delete(id) {
        const key = this.validation.parseKey(id);
        this.mutate((draft) => {
            draft.records.delete(key);
            draft.changed.delete(key);
            draft.created.delete(key);
        });
    }
    update(id, patch, trackChange = true) {
        const current = this.getItem(id);
        if (!current) {
            return;
        }
        const next = this.validation.parseItem({ ...current, ...patch });
        const key = this.validation.parseKey(id);
        if (this.validation.keyOf(next) !== key) {
            throw new Error(dataCoreErrors.changedIdentity);
        }
        this.mutate((draft) => {
            storeCollectionEntry(draft, [key, next], trackChange);
        });
    }
    clearTracking() {
        this.mutate((draft) => {
            draft.changed = new Set();
            draft.created = new Set();
        });
    }
}
