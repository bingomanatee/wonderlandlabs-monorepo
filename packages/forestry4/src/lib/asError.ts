export default function asError(value: unknown) {
  if (value instanceof Error) {
    return value;
  }
  if (!value) {
    return new Error('(unknown error in Forestry (maybe a validation $test?)');
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  return new Error('unknown / bad error in Forestry');
}
