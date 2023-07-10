"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepNode = void 0;
class DepNode {
    constructor(key, can, parent) {
        this.key = key;
        this.can = can;
        this.parent = parent;
    }
    get deps() {
        var _a;
        const depKeys = (_a = this.can.configs.get(this.key)) === null || _a === void 0 ? void 0 : _a.deps;
        if (depKeys === null || depKeys === void 0 ? void 0 : depKeys.length) {
            return depKeys.map((depKey) => new DepNode(depKey, this.can, this));
        }
        return [];
    }
    get parents() {
        if (!this.parent) {
            return [];
        }
        return [...this.parent.parents, this.key];
    }
    get errors() {
        return (this.deps.map(dep => {
            if (this.parents.includes(dep.key)) {
                console.error('circular dependency for ', dep.key, 'parents are ', dep.parents);
                return Object.assign(new Error('circular dependency'), { key: dep.key });
            }
            return dep.errors;
        })).flat();
    }
}
exports.DepNode = DepNode;
