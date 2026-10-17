export function recordId(input) {
    if (typeof input === 'string') {
        return input;
    }
    if (input && typeof input === 'object' && 'id' in input) {
        const id = input.id;
        if (typeof id === 'string') {
            return id;
        }
    }
    return '';
}
export function isRecordMap(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
export function fixtureRecordMap(fixtures, modelName) {
    const records = fixtures[modelName];
    if (Object.hasOwn(fixtures, modelName) && isRecordMap(records)) {
        return records;
    }
    const nextRecords = Object.create(null);
    setFixtureRecord(fixtures, modelName, nextRecords);
    return nextRecords;
}
export function setFixtureRecord(records, id, value) {
    Object.defineProperty(records, id, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}
