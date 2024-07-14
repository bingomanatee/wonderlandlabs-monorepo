"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEngineDistMap = void 0;
const constants_1 = require("../../constants");
const DataEngine_1 = __importDefault(require("./DataEngine"));
const dataEngineTypes_1 = require("./dataEngineTypes");
function setActionFactory(engine) {
    const action = {
        name: "set",
        cacheable: true,
        delta: function (branch, manifest) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const { key, val } = manifest;
            if (val === constants_1.DELETED) {
                map.delete(key);
            }
            else {
                map.set(key, val);
            }
            return map;
        },
    };
    return action;
}
function deleteActionFactory(engine) {
    const action = {
        name: "delete",
        cacheable: true,
        delta: function (branch, del) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            if ((0, dataEngineTypes_1.isSingleDel)(del)) {
                map.delete(del.delKey);
            }
            else if ((0, dataEngineTypes_1.isMultiDel)(del)) {
                del.delKeys.forEach((key) => map.delete(key));
            }
            return map;
        },
    };
    return action;
}
function patchEngineFactory(engine) {
    const action = {
        name: "patch",
        cacheable: true,
        delta(branch, modifier, options) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const manifest = modifier;
            manifest.forEach((val, key) => {
                if (val === constants_1.DELETED) {
                    map.delete(key);
                }
                else {
                    map.set(key, val);
                }
            });
            return map;
        },
    };
    return action;
}
function replaceActionFactory(engine) {
    const action = {
        name: "replace",
        cacheable: true,
        delta(branch, modifier, options) {
            return new Map(modifier);
        },
    };
    return action;
}
exports.dataEngineDistMap = {
    name: "distMap",
    factory(tree) {
        const engine = new DataEngine_1.default("distMap");
        engine.addAction(setActionFactory(engine));
        engine.addAction(deleteActionFactory(engine));
        engine.addAction(patchEngineFactory(engine));
        engine.addAction(replaceActionFactory(engine));
        return engine;
    },
};
