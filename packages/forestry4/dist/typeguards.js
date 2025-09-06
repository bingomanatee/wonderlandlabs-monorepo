function isObj(maybe) {
  return typeof maybe === "object" && maybe !== null;
}
function isZodParser(maybe) {
  return isObj(maybe) && typeof maybe.parse === "function";
}
function isStore(maybe) {
  return isObj(maybe) && "value" in maybe && typeof maybe.next === "function" && isObj(maybe?.acts) && isObj(maybe?.$);
}
export {
  isObj,
  isStore,
  isZodParser
};
//# sourceMappingURL=typeguards.js.map
