"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataEngineDistMap = void 0;
const constants_1 = require("../../constants");
const types_1 = require("../../types");
const DataEngine_1 = __importDefault(require("./DataEngine"));
const dataEngineTypes_1 = require("./dataEngineTypes");
function isKeyVal(a) {
    return (0, types_1.isObj)(a) && "key" in a && "val" in a;
}
function setActionFactory(engine) {
    const action = {
        name: "set",
        cacheable: true,
        delta: function (branch, args) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [a, b] = args;
            if (args.length == 1 && isKeyVal(a)) {
                const { key, val } = a;
                if (val === constants_1.DELETED) {
                    map.delete(key);
                }
                else {
                    map.set(key, val);
                }
            }
            else {
                if (b === constants_1.DELETED) {
                    map.delete(a);
                }
                else {
                    map.set(a, b);
                }
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
        delta: function (branch, keys) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [first] = keys;
            if ((0, dataEngineTypes_1.isDel)(first)) {
                if ((0, dataEngineTypes_1.isSingleDel)(first)) {
                    map.delete(first.delKey);
                }
                if ((0, dataEngineTypes_1.isMultiDel)(first)) {
                    for (const key of first.delKeys) {
                        map.delete(key);
                    }
                }
            }
            else {
                for (const key of keys) {
                    map.delete(key);
                }
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
        delta(branch, args) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [manifest] = args;
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
        delta(branch, args) {
            const [seed] = args;
            return new Map(seed);
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
