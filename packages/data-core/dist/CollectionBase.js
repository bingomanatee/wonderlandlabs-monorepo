import { Forest } from '@wonderlandlabs/forestry4';
import { collectionItemEntries, storeCollectionEntry, } from './collection.helpers.js';
import { createCollectionValidation, prepareCollectionEntry, } from './collection.validation.js';
import { bindCollectionUtilities } from './collection.utilities.js';
import { bindRecordUtilities } from './record.helpers.js';
import { findCollectionEntries, findCollectionItems, } from './collection.find.js';
import { CollectionPersistence } from './collection.persist.js';
import { dataCoreErrors } from './constants.js';
export class CollectionBase extends Forest {
    collectionMethods;
    recordMethods;
    keyOf;
    recordComparator;
    persistence;
    validation;
    constructor(params, config = {}) {
        super(params);
        this.recordComparator = config.recordComparator ?? Object.is;
        this.validation = createCollectionValidation(config);
        this.keyOf = this.validation.keyOf;
        this.persistence = new CollectionPersistence(this, this.validation.parseKey, config.persistRetry);
        this.collectionMethods = bindCollectionUtilities(this, config.collectionMethods ?? {});
        this.recordMethods = bindRecordUtilities(this, config.recordMethods ?? {}, this.validation.parseKey);
    }
    get persistWork$() {
        return this.persistence.work$;
    }
    get persistRetry$() {
        return this.persistence.retry$;
    }
    get persistCommitted$() {
        return this.persistence.committed$;
    }
    get persistExhausted$() {
        return this.persistence.exhausted$;
    }
    persist(args) {
        return this.persistence.persist(args);
    }
    syncRecords(records, clearLocalEdits = false) {
        const entries = collectionItemEntries(records, this.validation);
        const changes = entries.flatMap(([id, item]) => {
            const { records: current, changed, created } = this.value;
            const tracked = changed.has(id) || created.has(id);
            if (!clearLocalEdits && tracked)
                return [];
            const equivalent = current.has(id) && this.recordComparator(current.get(id), item);
            return equivalent && !tracked ? [] : [{ id, item, equivalent }];
        });
        if (!changes.length)
            return;
        this.mutate((draft) => {
            for (const { id, item, equivalent } of changes) {
                if (!equivalent)
                    draft.records.set(id, item);
                if (clearLocalEdits) {
                    draft.changed.delete(id);
                    draft.created.delete(id);
                }
            }
        });
    }
    abortPending(ids) {
        this.persistence.abortPending(ids);
    }
    pendingPersists() {
        return this.persistence.pending();
    }
    complete() {
        this.persistence?.stop();
        return super.complete();
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
    find(query, sortFn) {
        return findCollectionItems(this.value.records, query, this.validation.parseKey, sortFn);
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
    delete(query) {
        this.cleanCollection(typeof query === 'string' || typeof query === 'number'
            ? [query]
            : query);
    }
    cleanCollection(query) {
        const entries = findCollectionEntries(this.value.records, query, this.validation.parseKey);
        if (!entries.length)
            return;
        this.mutate((draft) => {
            for (const [key] of entries) {
                draft.records.delete(key);
                draft.changed.delete(key);
                draft.created.delete(key);
            }
        });
    }
    cleanAll() {
        this.mutate((draft) => {
            draft.records.clear();
            draft.changed.clear();
            draft.created.clear();
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
}
