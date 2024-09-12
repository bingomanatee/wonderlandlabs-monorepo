"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Branch_1 = require("./Branch");
const rxjs_1 = require("rxjs");
const utils_1 = require("./utils");
const Beaver_1 = __importDefault(require("./Tree/Beaver"));
const IttermittentCache_1 = require("./Tree/IttermittentCache");
class Tree {
    constructor(forest, name, params) {
        this.forest = forest;
        this.name = name;
        this.params = params;
        if (params && "initial" in params) {
            const { initial } = params;
            if (initial !== undefined) {
                this.root = new Branch_1.Branch(this, {
                    assert: initial,
                    name: "initial",
                });
                this.top = this.root;
            }
        }
        this.stream = new rxjs_1.BehaviorSubject(this.top);
    }
    get isUncacheable() {
        if (!this.params) {
            return false;
        }
        return Boolean(this.params.uncacheable);
    }
    next(next, name = "(next)") {
        this.grow({ assert: next, name });
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
            IttermittentCache_1.IttermittentCache.benchmark(this);
            Beaver_1.default.limitSize(this);
            this.stream.next(this.top);
            return this.top;
        });
    }
    validate(value) {
        if (!this.params?.validator) {
            return {
                isValid: true,
                value,
                tree: this,
            };
        }
        try {
            const err = this.params.validator(value, this);
            if (err) {
                return {
                    isValid: false,
                    value,
                    tree: this,
                    error: err.message,
                };
            }
        }
        catch (err) {
            let msg = "";
            if (err instanceof Error) {
                msg = err.message;
            }
            else if (typeof err == "string") {
                msg = err;
            }
            else {
                msg = `${err}`;
            }
            return {
                value,
                tree: this,
                isValid: false,
                error: msg,
            };
        }
    }
    get subject() {
        return this.stream.pipe((0, rxjs_1.filter)((b) => !!b), (0, rxjs_1.map)((b) => b.value));
    }
    subscribe(observer) {
        return this.subject.subscribe(observer);
    }
    valueAt(at) {
        if (!this.top) {
            return undefined;
        }
        let mostRecent = this.top;
        while (mostRecent) {
            if (mostRecent.time > at) {
                mostRecent = mostRecent.prev;
            }
            else {
                break;
            }
        }
        if (mostRecent) {
            return mostRecent.value;
        }
        return undefined;
    }
    get value() {
        if (!this.top) {
            throw new Error("cannot get the value from an empty tree");
        }
        return this.top.value;
    }
    addNote(message, params) {
        if (!this._notes) {
            this._notes = new Map();
        }
        utils_1.NotableHelper.addNote(this.forest.time, this._notes, message, params, this.name);
    }
    hasNoteAt(time) {
        return this._notes?.has(time) || false;
    }
    notes(fromTime, toTime = 0) {
        if (!this._notes) {
            return [];
        }
        return utils_1.NotableHelper.notes(this._notes, fromTime, toTime);
    }
    // #endregion
    /**
     *
     * returns the size of the tree (number of branches)
     * because _in theory_ a branch tree can be enormous, we provide an upTo
     * value - past which branches are not counted. For instance if upTo = 50
     * then the return value is going to be 0...50.
     *
     * if upTo is falsy, the true length of the branches
     * will be returned however deep that may be
     *
     * @param {number} upTo
     * @returns
     */
    branchCount(upTo) {
        if (!this.top)
            return 0;
        let count = 0;
        let current = this.top;
        while ((!upTo || count < upTo) && current) {
            count += 1;
            current = current.prev;
        }
        return count;
    }
}
exports.default = Tree;
