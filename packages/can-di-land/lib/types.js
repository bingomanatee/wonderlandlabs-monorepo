"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = exports.isResEventValues = exports.isEventValue = exports.isEventResource = exports.isEventInit = exports.isResConfig = exports.isResourceType = void 0;
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
function isEventInit(arg) {
    return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'init' && 'value' in arg && 'target' in arg);
}
exports.isEventInit = isEventInit;
function isEventResource(arg) {
    return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'resource' && 'value' in arg && 'target' in arg);
}
exports.isEventResource = isEventResource;
function isEventValue(arg) {
    return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'value' && 'value' in arg && 'target' in arg);
}
exports.isEventValue = isEventValue;
function isResEventValues(arg) {
    return !!(arg && typeof arg === 'object' && 'type' in arg && arg.type === 'values' && 'value' in arg);
}
exports.isResEventValues = isResEventValues;
function isPromise(arg) {
    return (!!(arg && typeof arg == 'object' && ('then' in arg) && typeof arg.then === 'function'));
}
exports.isPromise = isPromise;
