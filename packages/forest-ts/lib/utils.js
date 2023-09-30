"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareMaps = void 0;
const lodash_1 = require("lodash");
function compareMaps(map1, map2, query) {
    if (query.identity) {
        const firstValue = map1.get(query.identity);
        const secondValue = map2.get(query.identity);
        return (0, lodash_1.isEqual)(firstValue, secondValue);
    }
    if (map1.size !== map2.size) {
        return false;
    }
    return Array.from(map1.keys()).every((key) => {
        let v1 = map1.get(key);
        let v2 = map2.get(key);
        if (v1 === v2) {
            return true;
        }
        return (0, lodash_1.isEqual)(v1, v2);
    });
}
exports.compareMaps = compareMaps;
