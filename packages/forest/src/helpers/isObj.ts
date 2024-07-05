export function isObj(arg: unknown): arg is object {
  return !!(arg && typeof arg === "object");
}
