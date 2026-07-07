import { Path, PathElement } from '../types';

function toPathArray(p: Path): PathElement[] {
  if (Array.isArray(p)) {
    return p;
  }
  if (typeof p === 'string') {
    return p.split('.');
  }
  console.log('unparsable $path: ', p);
  throw new Error('cannot parse $path');
}

export function pathString(path: Path): string {
  return Array.isArray(path) ? path.map(String).join('.') : path;
}

export default function combinePaths(p: Path, p2: Path): PathElement[] {
  if (!Array.isArray(p)) {
    return combinePaths(toPathArray(p), p2);
  }

  if (!Array.isArray(p2)) {
    return combinePaths(p, toPathArray(p2));
  }

  if (!p.length) {
    return p2;
  }
  if (!p2.length) {
    return p;
  }
  return [...p, ...p2];
}
