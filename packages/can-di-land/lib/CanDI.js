"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanDI = void 0;
const rxjs_1 = require("rxjs");
const ResourceObj_1 = require("./ResourceObj");
/**
 * tracks resources added, with defined dependencies, an optional list of registry names.
 * note - resources are added immediately on the call of "set" -- however
 * if they have undefined dependencies, they are "pending"
 * -- their value will be undefined
 * until the dependencies are resolved.
 */
class CanDI {
    constructor(values) {
        this.registry = new Map();
        this.loadStream = new rxjs_1.Subject();
        values === null || values === void 0 ? void 0 : values.forEach((val) => {
            const resource = val.value;
            const config = val.config || val.type;
            if (config) {
                this.set(val.name, resource, config);
            }
        });
    }
    set(name, resource, config) {
        if (this.registry.has(name)) {
            const dep = this.registry.get(name);
            dep.resource = resource; // will throw if config.constant === false
            this.loadStream.next(name);
            return this;
        }
        if (!config) {
            config = { type: 'value' };
        }
        else if (typeof config === 'string') {
            config = { type: config };
        }
        if (!['comp', 'func', 'value'].includes(config.type)) {
            throw new Error('unknown type  for ' + name + ': ' + config.type);
        }
        /**
         * at this point two things are true:
         1: this is the first time the resource has been defined (it's not in the registry yet)
         2: the config is a defined ResConfig object
         3: the config is one of the accepted resource types
         */
        this.registry.set(name, new ResourceObj_1.ResourceObj(this, name, resource, config));
        this.loadStream.next(name);
        return this;
    }
    /**
     * returns the value of the resource(s); note, this is an async method.
     * @param name
     * @param time
     */
    get(name, time) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.has(name)) {
                return this.value(name);
            }
            return (0, rxjs_1.firstValueFrom)(this.when(name, time));
        });
    }
    /**
     * this is a synchronous retrieval function. it returns the value
     * of the resource IF it has been set, AND its dependencies have been resolved.
     *
     * @param name
     */
    value(name) {
        try {
            if (Array.isArray(name)) {
                return name.map((subName) => this.value(subName));
            }
            if (!this.registry.has(name)) {
                return undefined;
            }
            const reg = this.registry.get(name);
            return reg.pending ? undefined : reg.value;
        }
        catch (err) {
            console.log('---- value error:', err);
            return undefined;
        }
    }
    has(name) {
        if (Array.isArray(name)) {
            return name.every((subName) => this.has(subName));
        }
        if (!this.registry.has(name)) {
            return false;
        }
        return !this.registry.get(name).pending;
    }
    when(deps, maxTime = 0) {
        if ((typeof maxTime !== 'undefined') && maxTime >= 0) {
            return this.observe(deps)
                .pipe((0, rxjs_1.first)(), (0, rxjs_1.timeout)(maxTime + 1), (0, rxjs_1.map)((valueSet) => {
                return Array.isArray(deps) ? valueSet : valueSet[0];
            }));
        }
        return this.observe(deps).pipe((0, rxjs_1.first)(), (0, rxjs_1.map)((valueSet) => {
            return Array.isArray(deps) ? valueSet : valueSet[0];
        }));
    }
    observe(name) {
        const nameArray = Array.isArray(name) ? name : [name];
        return this.loadStream.pipe((0, rxjs_1.filter)((loadedName) => nameArray.includes(loadedName)), (0, rxjs_1.filter)(() => this.has(nameArray)), (0, rxjs_1.map)(() => {
            return this.value(nameArray);
        }));
    }
}
exports.CanDI = CanDI;
