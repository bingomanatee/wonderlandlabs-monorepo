import { isObj } from '../typeguards';

/**
 *
 * @param target an item - probably a complex item - to be traversed with path
 * @param path - ideally an array of tokens (Path) but it could be a single token (string/int).
 *
 */

export default function getPath(target: unknown, path: unknown) {
  if (path === null || path === undefined || path === '') return undefined;

  // Normalize path to array
  const pathArray = Array.isArray(path) ? path : [path];

  // Empty path returns the target itself
  if (pathArray.length === 0) {
    return target;
  }

  // Traverse the path using reduce
  return pathArray.reduce((current, key) => {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (current instanceof Map) {
      return current.get(key);
    } else if (isObj(current)) {
      return current[key];
    } else {
      return undefined;
    }
  }, target);
}
