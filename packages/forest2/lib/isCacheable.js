"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCacheable = isCacheable;
function isCacheableArray(a, depth = 0) {
    if (!Array.isArray(a)) {
        return false;
    }
    return a.every((v) => {
        return isCacheable(v, depth + 1);
    });
}
function isSimpleValue(value) {
    if (value === null || value === undefined) {
        return true;
    }
    let out = false;
    switch (typeof value) {
        case "number":
            out = true;
            break;
        case "undefined":
            out = true;
            break;
        case "string":
            out = true;
            break;
        case "symbol":
            out = true;
            break;
        case "boolean":
            out = true;
            break;
    }
    return out;
}
function isCacheableMap(value, depth = 0) {
    if (value.size > 50) {
        return false;
    }
    for (const [key, val] of value) {
        if (!isSimpleValue(key)) {
            return false;
        }
        if (!isCacheable(val, depth + 1)) {
            return false;
        }
    }
    return true;
}
function isCacheableObject(value, depth) {
    const valueRecord = value;
    if ("__proto" in valueRecord || "__prototype" in valueRecord) {
        return false;
    }
    // complex objects' inherited properties can be changed "under the rug" so never cache them.
    let out = true;
    for (const key of Object.keys(valueRecord)) {
        if (typeof key === "symbol") {
            out = false;
            break;
        }
        const keyValue = valueRecord[key];
        if (!isCacheable(keyValue, depth + 1)) {
            out = false;
            break;
        }
    }
}
function isCacheable(value, depth = 0) {
    if (depth > 3) {
        return false;
    }
    let out = false;
    if (isSimpleValue(value)) {
        return true;
    }
    switch (typeof value) {
        case "function":
            out = false;
            break;
        case "object":
            if (value === null) {
                return true;
            }
            if (value instanceof Map) {
                out = isCacheableMap(value, depth);
            }
            else if (value instanceof Set) {
                out = isCacheableArray(Array.from(value.values()), depth);
            }
            else {
                out = isCacheableObject(value, depth);
            }
            break;
        default:
            if (value === null || isCacheableArray(value, depth)) {
                out = true;
            }
            break;
    }
    return out;
}