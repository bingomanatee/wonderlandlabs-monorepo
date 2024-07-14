"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataEngine {
    constructor(name, validator) {
        this.name = name;
        this.validator = validator;
        this.actions = new Map();
    }
    addAction(actOrActFactory) {
        if (typeof actOrActFactory === "function") {
            return this.addAction(actOrActFactory(this));
        }
        this.actions.set(actOrActFactory.name, actOrActFactory);
        return this;
    }
}
exports.default = DataEngine;
