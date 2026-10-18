export function recordId(input: unknown) {
  if (typeof input === 'string') {
    return input
  }

  if (input && typeof input === 'object' && 'id' in input) {
    const id = input.id

    if (typeof id === 'string') {
      return id
    }
  }

  return ''
}

export function isRecordMap(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function fixtureRecordMap(
  fixtures: Record<string, unknown>,
  modelName: string,
) {
  const records = fixtures[modelName]

  if (Object.hasOwn(fixtures, modelName) && isRecordMap(records)) {
    return records
  }

  const nextRecords: Record<string, unknown> = Object.create(null)
  setFixtureRecord(fixtures, modelName, nextRecords)
  return nextRecords
}

export function setFixtureRecord(
  records: Record<string, unknown>,
  id: string,
  value: unknown,
) {
  Object.defineProperty(records, id, {
    configurable: true,
    enumerable: true,
    value,
    writable: true,
  })
}
