function methodize(actsMethods, self) {
  return Array.from(Object.keys(actsMethods)).reduce((memo, key) => {
    const fn = actsMethods[key];
    memo[key] = function(...args) {
      return fn.call(self, self.value, ...args);
    };
    return memo;
  }, {});
}
function testize(testFunctions, self) {
  if (Array.isArray(testFunctions)) {
    return testFunctions.map(
      (fn) => function(value) {
        return fn.call(self, value, self);
      }
    );
  } else {
    return function(value) {
      return testFunctions.call(self, value, self);
    };
  }
}
export {
  methodize,
  testize
};
//# sourceMappingURL=helpers.js.map
