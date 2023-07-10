"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyAnalyzer = void 0;
const collect_1 = require("@wonderlandlabs/collect");
class DependencyAnalyzer {
    constructor(can) {
        this.can = can;
        this.dependsOn = new Map();
        can.configs.forEach((config, configKey) => {
            var _a;
            (_a = config.deps) === null || _a === void 0 ? void 0 : _a.forEach((dep) => {
                this._addDep(configKey, dep);
            });
        });
    }
    get errors() {
        let errs = [];
        this.dependsOn.forEach((list, parentKey) => {
            list.forEach((dep) => {
                if (this.loop(parentKey, dep)) {
                    errs.push({ msg: 'loop', root: parentKey, to: dep });
                }
            });
        });
        return errs;
    }
    _trace(path) {
        const last = path[path.length - 1];
        if (this.dependsOn.has(last)) {
            const nextSet = this.dependsOn.get(last);
            nextSet.forEach((dep) => {
                if (path.includes(dep)) {
                    throw Object.assign(new Error('loop'), { path: [...path, dep] });
                }
                this._trace([...path, dep]);
            });
        }
    }
    loop(fromKey, toKey) {
        try {
            this._trace([fromKey, toKey]);
        }
        catch (err) {
            return true;
        }
        return false;
    }
    _addDep(parent, depKey) {
        if (!this.dependsOn.has(parent)) {
            this.dependsOn.set(parent, [depKey]);
        }
        else if (!this.dependsOn.get(parent).includes(depKey)) {
            this.dependsOn.get(parent).push(depKey);
        }
    }
    updateComputed(allValues, changedValues) {
        var _a;
        if ((_a = this.errors) === null || _a === void 0 ? void 0 : _a.length) {
            console.error('cannot update dependencies - loop:', this.errors);
            return;
        }
        const nodes = Array.from((0, collect_1.c)(this.dependsOn).getMap((deps, parentId) => {
            return new DepNode(this, parentId, deps);
        }).values());
        const nodeMap = new Map();
        nodes.forEach((node) => nodeMap.set(node.key, node));
        nodes.forEach(node => node.link(nodeMap));
        const rootNodes = nodes.filter((node) => node.isRoot);
        rootNodes.forEach((node) => {
            node.recompute(allValues, changedValues, []);
        });
    }
}
exports.DependencyAnalyzer = DependencyAnalyzer;
class DepNode {
    constructor(da, key, deps) {
        this.da = da;
        this.key = key;
        this.deps = deps;
        this.parentNodes = new Map();
        this.childNodes = new Map();
    }
    get isRoot() {
        return this.parentNodes.size === 0;
    }
    /**
     * recompute values in allValues if
     * a) their deps includes a changed value
     * b) their deps includes a recomputed value
     */
    recompute(allValues, changedValues, recomputedIds) {
        var _a;
        const can = this.da.can;
        this.childNodes.forEach((node) => node.recompute(allValues, changedValues, recomputedIds));
        if ((_a = can.configs.get(this.key)) === null || _a === void 0 ? void 0 : _a.final) {
            if (allValues.has(this.key)) {
                return;
            }
            if (!this.deps.every((depKey) => allValues.has(depKey))) {
                // cannot compute node - missing deps
                return;
            }
            if (!this.deps.some((depKey) => recomputedIds.includes(depKey) || changedValues.has(depKey))) {
                // there were no changed dependencies, and no dependency was recomputed
                return;
            }
            allValues.set(this.key, can.resAsFunction(this.key, allValues)());
        }
    }
    link(nodeMap) {
        this.deps.forEach((depKey) => {
            const childNode = nodeMap.get(depKey);
            if (childNode) {
                childNode.parentNodes.set(this.key, this);
                this.childNodes.set(childNode.key, childNode);
            }
        });
    }
}
