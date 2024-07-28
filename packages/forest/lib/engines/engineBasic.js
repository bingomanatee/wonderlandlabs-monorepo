"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEngineBasic = void 0;
const Engine_1 = __importDefault(require("./Engine"));
const replaceAction = {
    name: "set",
    mutator(_, val) {
        return val[0];
    },
};
exports.dataEngineBasic = {
    name: "basic",
    factory() {
        const engine = new Engine_1.default("basic");
        engine.addAction(replaceAction);
        return engine;
    },
};
