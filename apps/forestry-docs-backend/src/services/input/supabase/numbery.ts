export function numbery(s: string) {
  if (!s) return 0;
  const n = Number(s);
  if (Number.isNaN(n)) return 0;
  return n;
}
