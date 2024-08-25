"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProxy = setProxy;
const MapCollection_1 = require("./MapCollection");
function makeIterator(target, key, value) {
    return function* () {
        let keys = target.keys();
        let next = keys.next();
        while (!next.done) {
            const nextKey = next.value;
            if (nextKey !== key)
                yield [target.get(nextKey), nextKey];
            next = keys.next();
        }
        yield [value, key];
    };
}
function makeValueIterator(target, key, value) {
    return {
        [Symbol.iterator]: function* () {
            let keys = target.keys();
            let next = keys.next();
            while (!next.done) {
                const nextKey = next.value;
                if (nextKey !== key)
                    yield target.get(nextKey);
                next = keys.next();
            }
            yield value;
        },
    };
}
function makeKeyIterator(target, key) {
    return {
        [Symbol.iterator]: function* () {
            for (const k of target.keys()) {
                yield k;
            }
            yield key;
        },
    };
}
function makeEach(target, key, value) {
    return (eachFN) => {
        target.forEach(eachFN);
        eachFN(value, key);
    };
}
function setProxy(map, key, value) {
    if (!MapCollection_1.canProxy) {
        let newMap = new Map(map);
        newMap.set(key, value);
    }
    return new Proxy(map, {
        get(target, method) {
            if (!(0, MapCollection_1.isMapKey)(map, method)) {
                throw new Error("bad key");
            }
            let out = undefined;
            switch (method) {
                case "get":
                    out = (k) => (k === key ? value : target.get(k));
                    break;
                case "set":
                    out = MapCollection_1.noSet;
                    break;
                case "has":
                    out = (k) => k === key || target.has(k);
                    break;
                case "forEach":
                    out = makeEach(target, key, value);
                    break;
                case "keys":
                    out = () => makeKeyIterator(target, key);
                    break;
                case "values":
                    out = () => makeValueIterator(target, key, value);
                    break;
                case "size":
                    out = target.size + (target.has(key) ? 0 : 1);
                    break;
                case Symbol.iterator:
                    out = makeIterator(target, key, value);
                    break;
            }
            return out;
        },
    });
}
