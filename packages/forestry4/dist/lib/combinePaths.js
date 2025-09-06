function toPathArray(p) {
  if (Array.isArray(p)) {
    return p;
  }
  if (typeof p === "string") {
    return p.split(".");
  }
  if (p instanceof RegExp) {
    return [p];
  }
  console.log("unparsable path: ", p);
  throw new Error("cannot parse path");
}
function pathString(path) {
  return Array.isArray(path) ? path.join(".") : `${path}`;
}
function combinePaths(p, p2) {
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
export {
  combinePaths as default,
  pathString
};
//# sourceMappingURL=combinePaths.js.map
