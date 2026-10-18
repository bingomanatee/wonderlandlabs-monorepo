import { connectionStatus } from './constants.js';
export function createEmptyConnectionState() {
    return {
        connectedAt: null,
        error: '',
        serverTime: null,
        status: connectionStatus.idle,
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
