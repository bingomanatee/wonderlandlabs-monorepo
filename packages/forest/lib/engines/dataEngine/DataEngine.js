"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataEngine {
    constructor(name, params) {
        this.name = name;
        this.actions = new Map();
        if (params) {
            if (params?.cacheable) {
                this.cacheable = params.cacheable;
            }
            if (params?.validator) {
                this.validator = params.validator;
            }
        }
    }
    addAction(actOrActFactory) {
        if (typeof actOrActFactory === "function") {
            return this.addAction(actOrActFactory(this));
        }
        this.actions.set(actOrActFactory.name, actOrActFactory);
        if (this.tree) {
            //@ts-ignore
            this.tree.acts[actOrActFactory] = (...args) => this.tree.do(actOrActFactory.name, ...args);
        }
        return this;
    }
}
exports.default = DataEngine;
