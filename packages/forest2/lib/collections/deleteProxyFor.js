"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProxyFor = deleteProxyFor;
const MapCollection_1 = require("./MapCollection");
function makeIterator(target) {
    const { map, keys } = target;
    return function* () {
        for (const list of map) {
            const [listKey] = list;
            if (!keys.includes(listKey))
                yield list;
        }
    };
}
function makeValueIterator(target) {
    const { map, keys } = target;
    return () => ({
        // because one of the key may be redundant
        // we have to iterate over keys to find and skip it
        [Symbol.iterator]: function* () {
            for (const k of map.keys()) {
                if (!keys.includes(k))
                    yield map.get(k);
            }
        },
    });
}
function makeKeyIterator(target) {
    const { map, keys } = target;
    return () => ({
        [Symbol.iterator]: function* () {
            for (const k of map.keys()) {
                if (!keys.includes(k))
                    yield k;
            }
        },
    });
}
function getter(target, key) {
    return target.keys.includes(key) ? undefined : target.map.get(key);
}
function haser(target, key) {
    return key === (!target.keys.includes(key)) && target.map.has(key);
}
function makeEach(target) {
    const { map, keys } = target;
    return (eachFN) => {
        map.forEach((v, k) => {
            if (!keys.includes(k))
                eachFN(v, k);
        });
    };
}
function makeSizer(target) {
    const { map, keys } = target;
    let count = map.size;
    for (const k of keys) {
        if (map.has(k))
            count -= 1;
    }
    return Math.max(count, 0);
}
function deleteProxyFor(target) {
    const handler = {
        get(target, method) {
            if (!(0, MapCollection_1.isMapKey)(target.map, method)) {
                throw new Error("bad key");
            }
            let out = undefined;
            switch (method) {
                case "get":
                    out = (key) => getter(target, key);
                    break;
                case "set":
                    out = MapCollection_1.noSet;
                    break;
                case "clear":
                    out = MapCollection_1.noSet;
                case "has":
                    out = (key) => haser(target, key);
                    break;
                case "forEach":
                    out = makeEach(target);
                    break;
                case "keys":
                    out = makeKeyIterator(target);
                    break;
                case "values":
                    out = makeValueIterator(target);
                    break;
                case "size":
                    out = makeSizer(target);
                    break;
                case Symbol.iterator:
                    out = makeIterator(target);
                    break;
            }
            return out;
        },
    };
    // @ts-expect-error 2352
    return new Proxy(target, handler);
}
