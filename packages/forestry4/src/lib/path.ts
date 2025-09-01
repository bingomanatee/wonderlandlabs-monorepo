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
  // Navigate through all path elements using reduce
  const result = pathArray.reduce((current, pathSegment) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    const currentType = type.describe(current, true);

    switch (currentType) {
      case TypeEnum.map:
        return current.get(pathSegment);

      case TypeEnum.array: {
        if (typeof pathSegment === 'number') {
          return current[pathSegment];
        }
        const index = parseInt(pathSegment, 10);
        if (isNaN(index)) {
          return undefined;
        }
        return current[index];
      }
      case TypeEnum.object:
        return current[pathSegment];

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
export function setPath(draft: any, pathArray: Path, value: unknown): void {
  // Navigate through all but the last element using reduce
  if (!Array.isArray(pathArray)) {
    return setPath(draft, pathArray.split('.'), value);
  }
  const [target] = pathArray.slice(0, pathArray.length - 1).reduce(
    ([current], pathSegment) => {
      const currentType = type.describe(current, true);

      switch (currentType) {
        case TypeEnum.map:
          if (!current.has(pathSegment)) {
            current.set(pathSegment, {});
          }
          return [current.get(pathSegment)];

        case TypeEnum.array: {
          if (typeof pathSegment === 'number') {
            return current[pathSegment];
          }
          const index = parseInt(pathSegment, 10);
          if (isNaN(index)) {
            throw new Error(`Invalid array index: ${pathSegment}`);
          }
          if (current[index] === undefined) {
            current[index] = {};
          }
          return [current[index]];
        }
        case TypeEnum.object:
          if (
            current[pathSegment] === undefined ||
            current[pathSegment] === null
          ) {
            current[pathSegment] = {};
          }
          return [current[pathSegment]];

        default:
          throw new Error(`Cannot set nested value on type: ${currentType}`);
      }
    },
    [draft],
  );

  // Final assignment based on target type
  const finalKey = pathArray[pathArray.length - 1];
  const finalType = type.describe(target, true);

  switch (finalType) {
    case TypeEnum.map:
      target.set(finalKey, value);
      break;

    case TypeEnum.array:
      if (typeof finalKey === 'number') {
        target[finalKey] = value;
      } else {
        const index = parseInt(finalKey, 10);
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${finalKey}`);
        }
        target[index] = value;
      }
      break;

    case TypeEnum.object:
      target[finalKey] = value;
      break;

    default:
      throw new Error(`Cannot set value on type: ${finalType}`);
  }
}
