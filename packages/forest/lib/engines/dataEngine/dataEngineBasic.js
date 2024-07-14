"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEngineBasic = void 0;
const DataEngine_1 = __importDefault(require("./DataEngine"));
const replaceAction = {
    name: "set",
    delta(_, val) {
        return val;
    },
};
exports.dataEngineBasic = {
    name: "basic",
    factory() {
        const engine = new DataEngine_1.default("basic");
        engine.addAction(replaceAction);
        return engine;
    },
};
