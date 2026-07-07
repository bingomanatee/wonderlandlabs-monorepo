import { Path } from '../types';
import { type, TypeEnum } from '@wonderlandlabs/walrus';

/**
 * Helper function to get nested values from complex structures.
 * Uses Walrus type methods to identify the variation of each node.
 * Supports objects, arrays, Maps, and other complex structures.
 */
export function getPath(source: any, pathArray: Path): unknown {
  if (!Array.isArray(pathArray)) {
    return getPath(source, pathArray.split('.'));
  }
  // Navigate through all $path elements using reduce
  const result = pathArray.reduce<unknown>((current, pathSegment) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    const currentType = type.describe(current, true);
    const node = current as any;

    switch (currentType) {
      case TypeEnum.map:
        return node.get(pathSegment);

      case TypeEnum.array: {
        if (typeof pathSegment === 'number') {
          return node[pathSegment];
        }
        const index = Number.parseInt(String(pathSegment), 10);
        if (isNaN(index)) {
          return undefined;
        }
        return node[index];
      }
      case TypeEnum.object:
        return node[pathSegment as any];

      default:
        return undefined;
    }
  }, source);

  return result;
}

/**
 * Helper function to set nested values in Immer drafts.
 * Uses Walrus type methods to identify the variation of each node.
 * Supports objects, arrays, Maps, and other complex structures.
 */
export function setPath(draft: any, path: Path, value: unknown): void {
  // Navigate through all but the last element using reduce
  if (!Array.isArray(path)) {
    return setPath(draft, path.split('.'), value);
  }
  let target = draft;
  for (const pathSegment of path.slice(0, path.length - 1)) {
    const currentType = type.describe(target, true);
    const node = target as any;

    switch (currentType) {
      case TypeEnum.map:
        if (!node.has(pathSegment)) {
          node.set(pathSegment, {});
        }
        target = node.get(pathSegment);
        break;

      case TypeEnum.array: {
        const index =
          typeof pathSegment === 'number'
            ? pathSegment
            : Number.parseInt(String(pathSegment), 10);
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${pathSegment}`);
        }
        if (node[index] === undefined) {
          node[index] = {};
        }
        target = node[index];
        break;
      }

      case TypeEnum.object:
        if (
          node[pathSegment as any] === undefined ||
          node[pathSegment as any] === null
        ) {
          node[pathSegment as any] = {};
        }
        target = node[pathSegment as any];
        break;

      default:
        throw new Error(`Cannot set nested value on type: ${currentType}`);
    }
  }

  // Final assignment based on target type
  const finalKey = path[path.length - 1];
  const finalType = type.describe(target, true);
  const node = target as any;

  switch (finalType) {
    case TypeEnum.map:
      node.set(finalKey, value);
      break;

    case TypeEnum.array:
      if (typeof finalKey === 'number') {
        node[finalKey] = value;
      } else {
        const index = Number.parseInt(String(finalKey), 10);
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${finalKey}`);
        }
        node[index] = value;
      }
      break;

    case TypeEnum.object:
      node[finalKey as any] = value;
      break;

    default:
      throw new Error(`Cannot set value on type: ${finalType}`);
  }
}
