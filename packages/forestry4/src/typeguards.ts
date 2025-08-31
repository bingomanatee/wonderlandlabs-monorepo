import type { StoreIF } from './types';

export type ZodParser = {
  parse: (a: unknown) => unknown;
};

export function isObj(maybe: unknown): maybe is Record<string, unknown> {
  return typeof maybe === 'object' && maybe !== null;
}

export function isZodParser(maybe: unknown): maybe is ZodParser {
  return isObj(maybe) && typeof (maybe as any).parse === 'function';
}

export function isStore(maybe: unknown): maybe is StoreIF<unknown> {
  return (
    isObj(maybe) &&
    'value' in maybe &&
    typeof (maybe as any).next === 'function' &&
    isObj(maybe?.acts) &&
    isObj(maybe?.$)
  );
}
