"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineMap = void 0;
const constants_1 = require("../constants");
const types_1 = require("../types");
const Engine_1 = __importDefault(require("./Engine"));
const engineTypes_1 = require("./engineTypes");
function isKeyVal(a) {
    return (0, types_1.isObj)(a) && "key" in a && "val" in a;
}
function setActionFactory(engine) {
    const action = {
        name: "set",
        cacheable: true,
        mutator: function (branch, args) {
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
        mutator: function (branch, keys) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [first] = keys;
            if ((0, engineTypes_1.isDel)(first)) {
                if ((0, engineTypes_1.isSingleDel)(first)) {
                    map.delete(first.delKey);
                }
                if ((0, engineTypes_1.isMultiDel)(first)) {
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
        mutator(branch, args) {
            const map = branch.prev
                ? new Map(branch.prev.value)
                : new Map();
            const [manifest] = args;
            if (!(Array.isArray(manifest) || manifest instanceof Map)) {
                throw new Error("bad patch argument");
            }
            const next = Array.isArray(manifest) ? new Map(manifest) : manifest;
            next.forEach((val, key) => {
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
        mutator(branch, args) {
            const [seed] = args;
            return new Map(seed);
        },
    };
    return action;
}
exports.engineMap = {
    name: "map",
    factory(tree) {
        const engine = new Engine_1.default("map", {
            cacheable: constants_1.CACHE_TOP_ONLY,
            validator(value) {
                if (!(value instanceof Map)) {
                    throw new Error("DataEngineIF must be a map");
                }
                return false;
            },
        });
        engine.addAction(setActionFactory(engine));
        engine.addAction(deleteActionFactory(engine));
        engine.addAction(patchEngineFactory(engine));
        engine.addAction(replaceActionFactory(engine));
        return engine;
    },
};
