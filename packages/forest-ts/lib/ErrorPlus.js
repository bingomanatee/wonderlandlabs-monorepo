"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.ErrorPlus = void 0);
class ErrorPlus extends Error {
  constructor(r, s) {
    super(r), (this.data = s);
  }
}
exports.ErrorPlus = ErrorPlus;
