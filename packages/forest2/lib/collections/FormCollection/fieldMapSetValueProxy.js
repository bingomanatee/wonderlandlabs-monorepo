"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldMapSetValueProxy = fieldMapSetValueProxy;
const MapCollection_1 = require("../MapCollection/MapCollection");
const extendField_1 = __importDefault(require("./extendField"));
function getter(map, key, name, updatedField) {
    if (key !== name)
        return map.get(key);
    return updatedField;
}
/**
 *
 * this is a proxy that returns values from the previous map EXCEPT for when you get the entry whose value has been changed
 * io which case you get the extenedField.
 *
 * @param map
 * @param name
 * @param value
 * @param basis
 * @returns
 */
function fieldMapSetValueProxy(map, name, value, basis) {
    const updatedField = (0, extendField_1.default)({ name, value }, map.get(name), basis);
    const newGetter = (key) => getter(map, key, name, updatedField);
    const handler = {
        set() {
            throw new Error("forest field maps are immutable - cannot set any properties on field maps");
        },
        get(target, method) {
            let out = undefined;
            switch (method) {
                case "get":
                    out = newGetter;
                    break;
                case "set":
                    out = MapCollection_1.noSet;
                    break;
                case "clear":
                    out = MapCollection_1.noSet;
                    break;
                case "has":
                    out = (key) => target.has(key);
                    break;
                case "forEach":
                    out = (fn) => target.forEach(fn);
                    break;
                case "keys":
                    out = () => target.keys();
                    break;
                case "values":
                    out = () => target.values();
                    break;
                case "entries":
                    out = () => target.entries();
                    break;
                case "size":
                    out = target.size;
                    break;
                case Symbol.iterator:
                    out = target[Symbol.iterator];
                    break;
            }
            return out;
        },
    };
    // @ts-expect-error 2352
    return new Proxy(map, handler);
}
