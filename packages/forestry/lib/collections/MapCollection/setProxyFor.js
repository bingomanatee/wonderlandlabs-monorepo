"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProxyFor = setProxyFor;
const MapCollection_1 = require("./MapCollection");
function makeIterator(target) {
    const { map, key, value } = target;
    return function* () {
        for (const list of map) {
            yield list;
        }
        yield [key, value];
    };
}
function makeValueIterator(target) {
    const { map, key, value } = target;
    return () => ({
        // because one of the key may be redundant
        // we have to iterate over keys to find and skip it
        [Symbol.iterator]: function* () {
            for (const k of map.keys()) {
                if (k !== key) {
                    yield map.get(k);
                }
            }
            yield value;
        },
    });
}
function makeEntriesIterator(target) {
    const { map, key, value } = target;
    return () => ({
        // because one of the key may be redundant
        // we have to iterate over keys to find and skip it
        [Symbol.iterator]: function* () {
            for (const k of map.keys()) {
                if (k !== key) {
                    yield [k, map.get(k)];
                }
            }
            yield [key, value];
        },
    });
}
function makeKeyIterator(target) {
    const { map, key } = target;
    return () => ({
        [Symbol.iterator]: function* () {
            for (const k of map.keys()) {
                if (k !== key) {
                    yield k;
                }
            }
            yield key;
        },
    });
}
function getter(target, key) {
    return key === target.key ? target.value : target.map.get(key);
}
function haser(target, key) {
    return key === target.key ? true : target.map.has(key);
}
function makeEach(target) {
    const { map, key, value } = target;
    return (eachFN) => {
        map.forEach((v, k) => {
            if (k !== key) {
                eachFN(v, k);
            }
        });
        eachFN(value, key);
    };
}
function size(target) {
    const { map, key } = target;
    return map.has(key) ? map.size : map.size + 1;
}
function setProxyFor(target) {
    const handler = {
        set() {
            throw new Error('forest maps are immutable - cannot set any properties on maps');
        },
        get(target, method) {
            let out = undefined;
            switch (method) {
                case 'get':
                    out = (key) => getter(target, key);
                    break;
                case 'set':
                    out = MapCollection_1.noSet;
                    break;
                case 'clear':
                    out = MapCollection_1.noSet;
                    break;
                case 'has':
                    out = (key) => haser(target, key);
                    break;
                case 'forEach':
                    out = makeEach(target);
                    break;
                case 'keys':
                    out = makeKeyIterator(target);
                    break;
                case 'values':
                    out = makeValueIterator(target);
                    break;
                case 'entries':
                    out = makeEntriesIterator(target);
                    break;
                case 'size':
                    out = size(target);
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
