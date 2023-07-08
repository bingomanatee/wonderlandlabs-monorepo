export function compareArrays(a: any[], b: any[]) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => {
    return value === b[index];
  });
}

export function asArray(value: any) {
  return Array.isArray(value) ? value : [value]
}
