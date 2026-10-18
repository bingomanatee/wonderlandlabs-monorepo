import { BehaviorSubject, merge, Subscription } from 'rxjs';
import { dataCoreErrors } from './constants.js';
import { createEmptyConnectionState } from './factories.js';
export class DataConnectionManager {
    #connections;
    #subs = new Subscription();
    #started = false;
    changes$;
    state$ = new BehaviorSubject(createEmptyConnectionState());
    constructor(connections) {
        this.#connections = connections;
        this.changes$ = merge(...connections
            .map((connection) => connection.changes$)
            .filter((changes$) => Boolean(changes$)));
    }
    start() {
        if (this.#started || this.#subs.closed) {
            return;
        }
        this.#started = true;
        for (const connection of this.#connections) {
            if (connection.state$) {
                this.#subs.add(connection.state$.subscribe((state) => {
                    this.state$.next(state);
                }));
            }
            connection.start();
        }
    }
    stop() {
        this.#subs.unsubscribe();
        for (const connection of this.#connections) {
            connection.stop();
        }
    }
    async delete(modelName, input) {
        return this.tryConnections((connection) => connection.delete(modelName, input));
    }
    async get(modelName, input) {
        return this.tryConnections((connection) => connection.get(modelName, input));
    }
    async put(modelName, input) {
        return this.tryConnections((connection) => connection.put(modelName, input));
    }
    async tryConnections(execute) {
        let lastError = new Error(dataCoreErrors.dataSourceFailed);
        for (const connection of this.#connections) {
            try {
                await connection.ensureReady();
                return await execute(connection);
            }
            catch (error) {
                lastError = error;
            }
        }
        throw lastError;
    }
}
