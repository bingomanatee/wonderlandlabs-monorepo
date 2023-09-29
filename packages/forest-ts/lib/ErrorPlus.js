"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorPlus = void 0;
class ErrorPlus extends Error {
    constructor(msg, data) {
        super(msg);
        this.data = data;
    }
}
exports.ErrorPlus = ErrorPlus;
