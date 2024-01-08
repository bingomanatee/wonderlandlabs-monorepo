"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQueryDefJoin = exports.isQueryCollectionDefJoin = exports.isQueryNamedDefJoin = exports.isJoinObj = exports.isNonEmptyString = void 0;
const walrus_1 = require("@wonderlandlabs/walrus");
function isNonEmptyString(a) {
    return !!((typeof a === 'string') && a);
}
exports.isNonEmptyString = isNonEmptyString;
function isJoinObj(join) {
    if (!(walrus_1.type.describe(join, true) === walrus_1.TypeEnum.object)) {
        return false;
    }
    if (join.joins) {
        return Array.isArray(join.joins);
    }
    return true;
}
exports.isJoinObj = isJoinObj;
function isQueryNamedDefJoin(join) {
    return (walrus_1.type.describe(join, true) === walrus_1.TypeEnum.object) && (('name' in join) && (typeof join.name === 'string')
        && (isJoinObj(join)));
}
exports.isQueryNamedDefJoin = isQueryNamedDefJoin;
function isQueryCollectionDefJoin(join) {
    return (walrus_1.type.describe(join, true) === walrus_1.TypeEnum.object) && (('collection' in join) && (typeof join.collection === 'string')
        && (isJoinObj(join)));
}
exports.isQueryCollectionDefJoin = isQueryCollectionDefJoin;
function isQueryDefJoin(join) {
    return isQueryNamedDefJoin(join) || isQueryCollectionDefJoin(join);
}
exports.isQueryDefJoin = isQueryDefJoin;
