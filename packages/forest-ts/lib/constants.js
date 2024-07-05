"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.singleIdFactory = exports.SINGLE = exports.IDENTITY = void 0),
  (exports.IDENTITY = Symbol("identity")),
  (exports.SINGLE = Symbol("single"));
const singleIdFactory = () => exports.SINGLE;
exports.singleIdFactory = singleIdFactory;
