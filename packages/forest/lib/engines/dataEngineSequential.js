"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEngineSeq = void 0;
const constants_1 = require("../constants");
const initializer_1 = require("./actions/initializer");
const replaceAction = {
    name: "replace",
    delta(_, val) {
        return val;
    },
};
exports.dataEngineSeq = {
    name: "sequential",
    actions: new Map([
        [constants_1.ACTION_NAME_INITIALIZER, initializer_1.initializer],
        ["replace", replaceAction],
    ]),
};
