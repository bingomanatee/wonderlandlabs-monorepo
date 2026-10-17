import { Forest } from '@wonderlandlabs/forestry4';
import { createCollectionValue, createDataManagerValue } from './factories.js';
import { DataConnectionManager } from './DataConnectionManager.js';
import { dataCoreDefaults, dataCoreErrors } from './constants.js';
export class DataManager extends Forest {
    connector;
    constructor(config = {}) {
        super({
            name: config.name ?? dataCoreDefaults.managerName,
            value: config.value ?? createDataManagerValue(),
        });
        this.connector =
            config.connector ??
                (config.connections
                    ? new DataConnectionManager(config.connections)
                    : null);
    }
    get collections() {
        return this.value.collections;
    }
    addModel(name, branchClass, initialData = new Map()) {
        if (this.value.collections.has(name)) {
            throw new Error(dataCoreErrors.duplicateCollection(name));
        }
        this.mutate((draft) => {
            draft.collections.set(name, createCollectionValue());
        });
        try {
            const branch = this.$branches.$add(['collections', name], {
                name,
                subclass: branchClass,
            });
            branch.putMany(initialData, false);
            return branch;
        }
        catch (error) {
            this.$branches.$get(['collections', name])?.complete();
            this.$branches.delete(['collections', name]);
            this.mutate((draft) => {
                draft.collections.delete(name);
            });
            throw error;
        }
    }
    collection(name) {
        return this.$branches.$get(['collections', name]);
    }
}
