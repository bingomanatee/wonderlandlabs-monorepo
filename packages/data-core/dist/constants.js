export const connectionStatus = {
    connected: 'connected',
    connecting: 'connecting',
    disconnected: 'disconnected',
    error: 'error',
    idle: 'idle',
    validated: 'validated',
};
export const dataCoreDefaults = {
    managerName: 'DataManager',
    identity: 'id',
    persistRetryDelayMs: 1000,
    persistMaxRetries: 3,
};
export const dataCoreErrors = {
    invalidIdentity: 'Model identity must be a string or finite number',
    missingIdentity: 'Model schema is missing the identity property',
    schemaKeyOf: 'Use the schema identity property instead of keyOf',
    mismatchedIdentity: 'Record identity does not match its collection key',
    changedIdentity: 'Updates cannot change a record identity',
    invalidPersistRetry: 'Persist retry delay must be finite and nonnegative; ' +
        'retries must be a nonnegative integer',
    dataSourceFailed: 'Data source failed',
    duplicateCollection: (name) => `${name} data collection is already registered`,
    missingItemId: (storeName) => `${storeName} item is missing a string or number id`,
};
export const persistState = {
    pending: 'pending',
    active: 'active',
    complete: 'complete',
    failed: 'failed',
};
