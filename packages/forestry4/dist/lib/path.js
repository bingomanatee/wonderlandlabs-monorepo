import { type, TypeEnum } from "@wonderlandlabs/walrus";
function getPath(source, pathArray) {
  if (!Array.isArray(pathArray)) {
    return getPath(source, pathArray.split("."));
  }
  const result = pathArray.reduce((current, pathSegment) => {
    if (current === void 0 || current === null) {
      return void 0;
    }
    const currentType = type.describe(current, true);
    switch (currentType) {
      case TypeEnum.map:
        return current.get(pathSegment);
      case TypeEnum.array: {
        if (typeof pathSegment === "number") {
          return current[pathSegment];
        }
        const index = parseInt(pathSegment, 10);
        if (isNaN(index)) {
          return void 0;
        }
        return current[index];
      }
      case TypeEnum.object:
        return current[pathSegment];
      default:
        return void 0;
    }
  }, source);
  return result;
}
function setPath(draft, pathArray, value) {
  if (!Array.isArray(pathArray)) {
    return setPath(draft, pathArray.split("."), value);
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
          if (typeof pathSegment === "number") {
            return current[pathSegment];
          }
          const index = parseInt(pathSegment, 10);
          if (isNaN(index)) {
            throw new Error(`Invalid array index: ${pathSegment}`);
          }
          if (current[index] === void 0) {
            current[index] = {};
          }
          return [current[index]];
        }
        case TypeEnum.object:
          if (current[pathSegment] === void 0 || current[pathSegment] === null) {
            current[pathSegment] = {};
          }
          return [current[pathSegment]];
        default:
          throw new Error(`Cannot set nested value on type: ${currentType}`);
      }
    },
    [draft]
  );
  const finalKey = pathArray[pathArray.length - 1];
  const finalType = type.describe(target, true);
  switch (finalType) {
    case TypeEnum.map:
      target.set(finalKey, value);
      break;
    case TypeEnum.array:
      if (typeof finalKey === "number") {
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
export {
  getPath,
  setPath
};
//# sourceMappingURL=path.js.map
