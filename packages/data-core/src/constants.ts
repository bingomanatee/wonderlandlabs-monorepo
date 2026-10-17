export const modelSocketStatus = {
  connected: 'connected',
  connecting: 'connecting',
  disconnected: 'disconnected',
  error: 'error',
  idle: 'idle',
  validated: 'validated',
} as const

export const dataCoreDefaults = {
  managerName: 'DataManager',
  identity: 'id',
} as const

export const dataCoreErrors = {
  invalidIdentity: 'Model identity must be a string or finite number',
  missingIdentity: 'Model schema is missing the identity property',
  schemaKeyOf: 'Use the schema identity property instead of keyOf',
  mismatchedIdentity: 'Record identity does not match its collection key',
  changedIdentity: 'Updates cannot change a record identity',
  dataSourceFailed: 'Data source failed',
  duplicateCollection: (name: string) =>
    `${name} data collection is already registered`,
  missingItemId: (storeName: string) =>
    `${storeName} item is missing a string or number id`,
} as const
