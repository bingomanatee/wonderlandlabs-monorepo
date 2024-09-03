"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Branch_1 = require("./Branch");
const rxjs_1 = require("rxjs");
const UNINITIALIZED = Symbol('tree has no value');
class Tree {
    constructor(forest, name, params) {
        this.forest = forest;
        this.name = name;
        this.params = params;
        if (params && 'initial' in params) {
            const { initial } = params;
            if (initial !== undefined) {
                this.root = new Branch_1.Branch(this, {
                    next: initial,
                });
                this.top = this.root;
            }
        }
        this.stream = new rxjs_1.BehaviorSubject(this.top);
    }
    next(next) {
        this.grow({ next });
    }
    rollback(time, message) {
        if (!this.top) {
            return;
        }
        if (this.top.time < time) {
            return;
        }
        let firstObs = this.top;
        while (firstObs.prev && firstObs.prev.time >= time) {
            firstObs = firstObs.prev;
        }
        const offshoot = {
            time,
            error: message,
            branch: firstObs,
        };
        if (!this.offshoots) {
            this.offshoots = [];
        }
        this.offshoots.push(offshoot);
        const last = firstObs.prev;
        this.top = last;
        if (last) {
            last.next = undefined;
        }
        else {
            this.root = undefined;
            this.top = undefined;
        }
    }
    grow(change) {
        return this.forest.do(() => {
            const next = new Branch_1.Branch(this, change);
            if (this.top) {
                this.top.linkTo(next);
            }
            else {
                this.root = next;
            }
            this.top = next;
            if (this.params?.validator) {
                const err = this.params.validator(next.value, this);
                if (err) {
                    throw err;
                }
            }
            this.stream.next(this.top);
            return next;
        });
    }
    get subject() {
        return this.stream.pipe((0, rxjs_1.filter)((b) => !!b), (0, rxjs_1.map)((b) => b.value));
    }
    subscribe(observer) {
        return this.subject.subscribe(observer);
    }
    get value() {
        if (!this.top) {
            throw new Error('cannot get the value from an empty tree');
        }
        return this.top.value;
    }
}
exports.default = Tree;
