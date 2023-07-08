"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = exports.isResConfig = exports.isResourceType = void 0;
const resourceTypes = ['value', 'func', 'comp'];
function isResourceType(arg) {
    // @ts-ignore
    return resourceTypes.includes(arg);
}
exports.isResourceType = isResourceType;
function isResConfig(config) {
    if (!(config && typeof config === 'object')) {
        return false;
    }
    // @ts-ignore
    if (!config && isResourceType(config.type)) {
        return false;
    }
    return !['final', 'computeOnce', 'async', 'bind', 'meta'].some((param) => (
    // @ts-ignore
    (param in config) && (typeof config[param] !== 'boolean')));
}
exports.isResConfig = isResConfig;
function isPromise(arg) {
    return (!!(arg && typeof arg == 'object' && ('then' in arg) && typeof arg.then === 'function'));
}
exports.isPromise = isPromise;
