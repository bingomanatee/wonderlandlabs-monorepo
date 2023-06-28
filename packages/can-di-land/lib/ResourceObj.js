"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceObj = void 0;
const rxjs_1 = require("rxjs");
/**
 * this is a value stored in the can's registry.
 * It is assumed that once set, this instance is never replaced --
 * that is, its resource may be replaced, but it as instance is not.
 *
 *
 */
class ResourceObj {
    constructor(can, name, resource, config) {
        var _a;
        this.can = can;
        this.name = name;
        this.config = config;
        this._promise = false;
        this.computed = false;
        this.__value = undefined;
        if (this.type === 'value') {
            if ((_a = config.deps) === null || _a === void 0 ? void 0 : _a.length) {
                throw new Error('value properties cannot have dependencies ' + name);
            }
            if (this.isComputeOnce) {
                console.warn(name, ': computeOnce has no effect on value entries -- did you mean to set final?');
            }
        }
        this.resource = resource;
        if (this.type === 'func') {
            this._value = this.calculator;
        }
        if (this.type === 'comp') {
            this.listenForValue();
        }
    }
    calcComp() {
        if (this.isComputeOnce && this.computed) {
            console.warn('attempt to re-compute', this.name);
            return;
        }
        if (this.config.async) {
            this.calculator()
                .then((result) => {
                this._value = result;
                this.computed = true;
            });
        }
        else {
            this._value = this.calculator();
            this.computed = true;
        }
    }
    listenForValue() {
        const subject = this;
        const deps = this.hasDeps ? [...this.config.deps] : [];
        if (!deps.length) {
            this.calcComp();
            return;
        }
        if (this.config.computeOnce) {
            this._computeSub = this.can.observe(deps)
                .pipe((0, rxjs_1.first)())
                .subscribe(() => {
                console.log('--- computing once with resource', this._resource.toString());
                this.calcComp();
            });
        }
        else {
            this._computeSub = this.can.observe(deps)
                .pipe((0, rxjs_1.switchMap)((args) => {
                return this.config.async ? (0, rxjs_1.from)(this.calculator()) : (0, rxjs_1.of)(this.calculator());
            })).subscribe(({
                next(value) {
                    subject._value = value;
                    subject.computed = true; // @TODO: protect against sync errors
                }
            }));
        }
    }
    get hasDeps() {
        var _a;
        return !!((_a = this.config.deps) === null || _a === void 0 ? void 0 : _a.length);
    }
    get resource() {
        return this._resource;
    }
    set resource(value) {
        if (this.isFinal && this.added) {
            throw new Error('cannot change resource ' + this.name);
        }
        if (this.type === 'comp' || this.type === 'func') {
            if (!(typeof value === 'function')) {
                throw new Error(`attempt to pass a non-functional value to ${this.name} (type ${this.type})`);
            }
        }
        this._resource = value;
        this.added = Date.now();
        switch (this.type) {
            case 'comp':
                if ((!this.isComputeOnce || !this.computed) && this._computeSub) {
                    this._computeSub.unsubscribe();
                    this.listenForValue();
                }
                break;
            case 'func':
                break;
            case 'value':
                if (this.config.async) {
                    this._promise = true;
                    this._resource.then(() => {
                        this._promise = false;
                    });
                }
        }
    }
    get pending() {
        var _a;
        if (this._promise) {
            return true;
        }
        if (!((_a = this.config.deps) === null || _a === void 0 ? void 0 : _a.length)) {
            return false;
        }
        return this.type === 'comp' && this.config.async && !this.computed;
    }
    get _value() {
        return this.__value;
    }
    set _value(val) {
        this.__value = val;
        // for observation
    }
    // ------- shortcuts to config
    get type() {
        return this.config.type;
    }
    get isFinal() {
        return !!this.config.final;
    }
    get isComputeOnce() {
        return !!this.config.computeOnce;
    }
    /**
     * returns the value of the dependencies (if any) mapped out from can.
     * It's an "all or nothing" approach -- unless the can has ALL the required resources
     * an array of undefined values are returned.
     * @private
     */
    get deps() {
        var _a;
        if (!((_a = this.config.deps) === null || _a === void 0 ? void 0 : _a.length)) {
            return [];
        }
        if (!this.can.has(this.config.deps)) {
            // console.log('can doesnt have deps:', this.config.deps, this.can);
            return this.config.deps.map(() => undefined);
        }
        return this.can.value(this.config.deps);
    }
    get args() {
        return this.config.args || [];
    }
    /**
     * returns the resource as a function; note -- this will not ALWAYS be rational;
     * should only be called when the type is known to be 'func' or 'comp'.
     *
     * Note: the arguments are spread from
     * (1) the dependencies pulled from the can, if any
     * (2) the config args, if any
     * (3) any inputs passed into the calculator, if any
     *
     * so, the resource needs to be able to accept the arguments with the proper offset
     * based on the count of parameters derived from these values.
     *
     * It's advised to use either dynamic params passed to the calculator
     * OR hard-coded args form the config;
     *
     * if you use both, take care.
     *
     * @private
     */
    get calculator() {
        return (...params) => {
            const allParams = [...this.deps, ...this.args, ...params];
            let base = this.config.meta ? this.resource() : this.resource;
            const method = this.config.bind ? base.bind(this.can) : base;
            return (method)(...allParams);
        };
    }
    get value() {
        if (this.pending) {
            console.log(this.name, 'pending - not returning value');
            return undefined;
        }
        if (this.type === 'value') {
            return this.resource;
        }
        return this._value;
    }
    /**
     * clears the computed registry if a dependency is added / updated
     * @private
     */
    invalidateOnAddition() {
        var _a;
        if (this._computeSub) {
            return;
        }
        const subject = this;
        const stream = ((_a = this.config.deps) === null || _a === void 0 ? void 0 : _a.length) ? this.can.loadStream.pipe((0, rxjs_1.filter)((name) => (this.config.deps || []).includes(name))) : this.can.loadStream;
        this._computeSub = stream.subscribe({
            next: () => subject.computed = false,
            error() {
                var _a;
                (_a = subject._computeSub) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            },
            complete() {
                var _a;
                (_a = subject._computeSub) === null || _a === void 0 ? void 0 : _a.unsubscribe();
            }
        });
    }
}
exports.ResourceObj = ResourceObj;
