import { modelSocketStatus } from './constants.js';
export function createEmptyModelSocketState() {
    return {
        connectedAt: null,
        error: '',
        serverTime: null,
        status: modelSocketStatus.idle,
        validatedAt: null,
    };
}
export function createCollectionValue() {
    return {
        changed: new Set(),
        created: new Set(),
        records: new Map(),
    };
}
export function createDataManagerValue() {
    return {
        collections: new Map(),
    };
}
