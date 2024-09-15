"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.PromiseQueue = exports.CanDI = void 0);
var CanDI_1 = require("./CanDI"),
  PromiseQueue_1 =
    (Object.defineProperty(exports, "CanDI", {
      enumerable: !0,
      get: function () {
        return CanDI_1.CanDI;
      },
    }),
    require("./PromiseQueue"));
Object.defineProperty(exports, "PromiseQueue", {
  enumerable: !0,
  get: function () {
    return PromiseQueue_1.PromiseQueue;
  },
});
