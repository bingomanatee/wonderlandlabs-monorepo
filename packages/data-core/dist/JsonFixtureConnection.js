import { BehaviorSubject, Subject } from 'rxjs';
import { fixtureRecordMap, setFixtureRecord, recordId, } from './fixture.helpers.js';
import { createEmptyModelSocketState } from './factories.js';
import { modelSocketStatus } from './constants.js';
export class JsonFixtureConnection {
    changes$ = new Subject();
    state$ = new BehaviorSubject(createEmptyModelSocketState());
    fixtures;
    constructor(fixtures) {
        this.fixtures = structuredClone(fixtures);
    }
    async ensureReady() { }
    async delete(modelName, input) {
        const id = recordId(input);
        if (id) {
            delete fixtureRecordMap(this.fixtures, modelName)[id];
        }
        return undefined;
    }
    async get(modelName, input) {
        const id = recordId(input);
        const records = fixtureRecordMap(this.fixtures, modelName);
        return structuredClone((id
            ? Object.hasOwn(records, id)
                ? records[id]
                : undefined
            : Object.values(records)));
    }
    async put(modelName, input) {
        const records = fixtureRecordMap(this.fixtures, modelName);
        const items = Array.isArray(input) ? input : [input];
        for (const item of items) {
            const id = recordId(item);
            if (id) {
                setFixtureRecord(records, id, structuredClone(item));
            }
        }
        return structuredClone(input);
    }
    start() {
        this.state$.next({
            ...createEmptyModelSocketState(),
            connectedAt: new Date().toISOString(),
            status: modelSocketStatus.connected,
        });
    }
    stop() {
        this.state$.complete();
        this.changes$.complete();
    }
}
