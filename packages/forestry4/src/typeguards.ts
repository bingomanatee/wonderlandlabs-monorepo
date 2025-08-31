export type ZodParser = {
  parse: (a: unknown) => unknown;
};

export function isZodParser(maybe: unknown): maybe is ZodParser {
  return (
    typeof maybe === 'object' &&
    maybe !== null &&
    typeof (maybe as any).parse === 'function'
  );
}
