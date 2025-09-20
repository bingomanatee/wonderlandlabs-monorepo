import { BehaviorSubject, Subject, map } from "rxjs";
import { isEqual, get } from "lodash-es";
import { enableMapSet, produce } from "immer";
import { type, TypeEnum } from "@wonderlandlabs/walrus";
function isFunction(value) {
  return typeof value === "function";
}
function hasLift(source) {
  return isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
  return function(source) {
    if (hasLift(source)) {
      return source.lift(function(liftedSource) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function() {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }
  return ar;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
    if (ar || !(i in from)) {
      if (!ar) ar = Array.prototype.slice.call(from, 0, i);
      ar[i] = from[i];
    }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function createErrorClass(createImpl) {
  var _super = function(instance) {
    Error.call(instance);
    instance.stack = new Error().stack;
  };
  var ctorFunc = createImpl(_super);
  ctorFunc.prototype = Object.create(Error.prototype);
  ctorFunc.prototype.constructor = ctorFunc;
  return ctorFunc;
}
var UnsubscriptionError = createErrorClass(function(_super) {
  return function UnsubscriptionErrorImpl(errors) {
    _super(this);
    this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i) {
      return i + 1 + ") " + err.toString();
    }).join("\n  ") : "";
    this.name = "UnsubscriptionError";
    this.errors = errors;
  };
});
function arrRemove(arr, item) {
  if (arr) {
    var index = arr.indexOf(item);
    0 <= index && arr.splice(index, 1);
  }
}
var Subscription = function() {
  function Subscription2(initialTeardown) {
    this.initialTeardown = initialTeardown;
    this.closed = false;
    this._parentage = null;
    this._finalizers = null;
  }
  Subscription2.prototype.unsubscribe = function() {
    var e_1, _a, e_2, _b;
    var errors;
    if (!this.closed) {
      this.closed = true;
      var _parentage = this._parentage;
      if (_parentage) {
        this._parentage = null;
        if (Array.isArray(_parentage)) {
          try {
            for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
              var parent_1 = _parentage_1_1.value;
              parent_1.remove(this);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        } else {
          _parentage.remove(this);
        }
      }
      var initialFinalizer = this.initialTeardown;
      if (isFunction(initialFinalizer)) {
        try {
          initialFinalizer();
        } catch (e) {
          errors = e instanceof UnsubscriptionError ? e.errors : [e];
        }
      }
      var _finalizers = this._finalizers;
      if (_finalizers) {
        this._finalizers = null;
        try {
          for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
            var finalizer = _finalizers_1_1.value;
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors !== null && errors !== void 0 ? errors : [];
              if (err instanceof UnsubscriptionError) {
                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
              } else {
                errors.push(err);
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      if (errors) {
        throw new UnsubscriptionError(errors);
      }
    }
  };
  Subscription2.prototype.add = function(teardown) {
    var _a;
    if (teardown && teardown !== this) {
      if (this.closed) {
        execFinalizer(teardown);
      } else {
        if (teardown instanceof Subscription2) {
          if (teardown.closed || teardown._hasParent(this)) {
            return;
          }
          teardown._addParent(this);
        }
        (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
      }
    }
  };
  Subscription2.prototype._hasParent = function(parent) {
    var _parentage = this._parentage;
    return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
  };
  Subscription2.prototype._addParent = function(parent) {
    var _parentage = this._parentage;
    this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
  };
  Subscription2.prototype._removeParent = function(parent) {
    var _parentage = this._parentage;
    if (_parentage === parent) {
      this._parentage = null;
    } else if (Array.isArray(_parentage)) {
      arrRemove(_parentage, parent);
    }
  };
  Subscription2.prototype.remove = function(teardown) {
    var _finalizers = this._finalizers;
    _finalizers && arrRemove(_finalizers, teardown);
    if (teardown instanceof Subscription2) {
      teardown._removeParent(this);
    }
  };
  Subscription2.EMPTY = function() {
    var empty = new Subscription2();
    empty.closed = true;
    return empty;
  }();
  return Subscription2;
}();
Subscription.EMPTY;
function isSubscription(value) {
  return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
}
function execFinalizer(finalizer) {
  if (isFunction(finalizer)) {
    finalizer();
  } else {
    finalizer.unsubscribe();
  }
}
var timeoutProvider = {
  setTimeout: function(handler, timeout) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
  },
  clearTimeout: function(handle) {
    return clearTimeout(handle);
  },
  delegate: void 0
};
function reportUnhandledError(err) {
  timeoutProvider.setTimeout(function() {
    {
      throw err;
    }
  });
}
function noop() {
}
var Subscriber = function(_super) {
  __extends(Subscriber2, _super);
  function Subscriber2(destination) {
    var _this = _super.call(this) || this;
    _this.isStopped = false;
    if (destination) {
      _this.destination = destination;
      if (isSubscription(destination)) {
        destination.add(_this);
      }
    } else {
      _this.destination = EMPTY_OBSERVER;
    }
    return _this;
  }
  Subscriber2.create = function(next, error, complete) {
    return new SafeSubscriber(next, error, complete);
  };
  Subscriber2.prototype.next = function(value) {
    if (this.isStopped) ;
    else {
      this._next(value);
    }
  };
  Subscriber2.prototype.error = function(err) {
    if (this.isStopped) ;
    else {
      this.isStopped = true;
      this._error(err);
    }
  };
  Subscriber2.prototype.complete = function() {
    if (this.isStopped) ;
    else {
      this.isStopped = true;
      this._complete();
    }
  };
  Subscriber2.prototype.unsubscribe = function() {
    if (!this.closed) {
      this.isStopped = true;
      _super.prototype.unsubscribe.call(this);
      this.destination = null;
    }
  };
  Subscriber2.prototype._next = function(value) {
    this.destination.next(value);
  };
  Subscriber2.prototype._error = function(err) {
    try {
      this.destination.error(err);
    } finally {
      this.unsubscribe();
    }
  };
  Subscriber2.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  };
  return Subscriber2;
}(Subscription);
var ConsumerObserver = function() {
  function ConsumerObserver2(partialObserver) {
    this.partialObserver = partialObserver;
  }
  ConsumerObserver2.prototype.next = function(value) {
    var partialObserver = this.partialObserver;
    if (partialObserver.next) {
      try {
        partialObserver.next(value);
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  ConsumerObserver2.prototype.error = function(err) {
    var partialObserver = this.partialObserver;
    if (partialObserver.error) {
      try {
        partialObserver.error(err);
      } catch (error) {
        handleUnhandledError(error);
      }
    } else {
      handleUnhandledError(err);
    }
  };
  ConsumerObserver2.prototype.complete = function() {
    var partialObserver = this.partialObserver;
    if (partialObserver.complete) {
      try {
        partialObserver.complete();
      } catch (error) {
        handleUnhandledError(error);
      }
    }
  };
  return ConsumerObserver2;
}();
var SafeSubscriber = function(_super) {
  __extends(SafeSubscriber2, _super);
  function SafeSubscriber2(observerOrNext, error, complete) {
    var _this = _super.call(this) || this;
    var partialObserver;
    if (isFunction(observerOrNext) || !observerOrNext) {
      partialObserver = {
        next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
        error: error !== null && error !== void 0 ? error : void 0,
        complete: complete !== null && complete !== void 0 ? complete : void 0
      };
    } else {
      {
        partialObserver = observerOrNext;
      }
    }
    _this.destination = new ConsumerObserver(partialObserver);
    return _this;
  }
  return SafeSubscriber2;
}(Subscriber);
function handleUnhandledError(error) {
  {
    reportUnhandledError(error);
  }
}
function defaultErrorHandler(err) {
  throw err;
}
var EMPTY_OBSERVER = {
  closed: true,
  next: noop,
  error: defaultErrorHandler,
  complete: noop
};
function identity(x) {
  return x;
}
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = function(_super) {
  __extends(OperatorSubscriber2, _super);
  function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
    var _this = _super.call(this, destination) || this;
    _this.onFinalize = onFinalize;
    _this.shouldUnsubscribe = shouldUnsubscribe;
    _this._next = onNext ? function(value) {
      try {
        onNext(value);
      } catch (err) {
        destination.error(err);
      }
    } : _super.prototype._next;
    _this._error = onError ? function(err) {
      try {
        onError(err);
      } catch (err2) {
        destination.error(err2);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._error;
    _this._complete = onComplete ? function() {
      try {
        onComplete();
      } catch (err) {
        destination.error(err);
      } finally {
        this.unsubscribe();
      }
    } : _super.prototype._complete;
    return _this;
  }
  OperatorSubscriber2.prototype.unsubscribe = function() {
    var _a;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var closed_1 = this.closed;
      _super.prototype.unsubscribe.call(this);
      !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
    }
  };
  return OperatorSubscriber2;
}(Subscriber);
function distinctUntilChanged(comparator, keySelector) {
  if (keySelector === void 0) {
    keySelector = identity;
  }
  comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
  return operate(function(source, subscriber) {
    var previousKey;
    var first = true;
    source.subscribe(createOperatorSubscriber(subscriber, function(value) {
      var currentKey = keySelector(value);
      if (first || !comparator(previousKey, currentKey)) {
        first = false;
        previousKey = currentKey;
        subscriber.next(value);
      }
    }));
  });
}
function defaultCompare(a, b) {
  return a === b;
}
function asError(value) {
  if (value instanceof Error) {
    return value;
  }
  if (!value) {
    return new Error("(unknown error in Forestry (maybe a validation $test?)");
  }
  if (typeof value === "string") {
    return new Error(value);
  }
  return new Error("unknown / bad error in Forestry");
}
function isObj(maybe) {
  return typeof maybe === "object" && maybe !== null;
}
function isZodParser(maybe) {
  return isObj(maybe) && typeof maybe.parse === "function";
}
function isStore(maybe) {
  return isObj(maybe) && "value" in maybe && typeof maybe.next === "function" && typeof maybe.subscribe === "function";
}
function testize(testFunctions, self) {
  if (Array.isArray(testFunctions)) {
    return testFunctions.map(
      (fn) => function(value) {
        return fn.call(self, value, self);
      }
    );
  } else {
    return function(value) {
      return testFunctions.call(self, value, self);
    };
  }
}
function getPath(source, pathArray) {
  if (!Array.isArray(pathArray)) {
    return getPath(source, pathArray.split("."));
  }
  const result = pathArray.reduce((current, pathSegment) => {
    if (current === void 0 || current === null) {
      return void 0;
    }
    const currentType = type.describe(current, true);
    switch (currentType) {
      case TypeEnum.map:
        return current.get(pathSegment);
      case TypeEnum.array: {
        if (typeof pathSegment === "number") {
          return current[pathSegment];
        }
        const index = parseInt(pathSegment, 10);
        if (isNaN(index)) {
          return void 0;
        }
        return current[index];
      }
      case TypeEnum.object:
        return current[pathSegment];
      default:
        return void 0;
    }
  }, source);
  return result;
}
function setPath(draft, path, value) {
  if (!Array.isArray(path)) {
    return setPath(draft, path.split("."), value);
  }
  const [target] = path.slice(0, path.length - 1).reduce(
    ([current], pathSegment) => {
      const currentType = type.describe(current, true);
      switch (currentType) {
        case TypeEnum.map:
          if (!current.has(pathSegment)) {
            current.set(pathSegment, {});
          }
          return [current.get(pathSegment)];
        case TypeEnum.array: {
          if (typeof pathSegment === "number") {
            return current[pathSegment];
          }
          const index = parseInt(pathSegment, 10);
          if (isNaN(index)) {
            throw new Error(`Invalid array index: ${pathSegment}`);
          }
          if (current[index] === void 0) {
            current[index] = {};
          }
          return [current[index]];
        }
        case TypeEnum.object:
          if (current[pathSegment] === void 0 || current[pathSegment] === null) {
            current[pathSegment] = {};
          }
          return [current[pathSegment]];
        default:
          throw new Error(`Cannot set nested value on type: ${currentType}`);
      }
    },
    [draft]
  );
  const finalKey = path[path.length - 1];
  const finalType = type.describe(target, true);
  switch (finalType) {
    case TypeEnum.map:
      target.set(finalKey, value);
      break;
    case TypeEnum.array:
      if (typeof finalKey === "number") {
        target[finalKey] = value;
      } else {
        const index = parseInt(finalKey, 10);
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${finalKey}`);
        }
        target[index] = value;
      }
      break;
    case TypeEnum.object:
      target[finalKey] = value;
      break;
    default:
      throw new Error(`Cannot set value on type: ${finalType}`);
  }
}
function toPathArray(p) {
  if (Array.isArray(p)) {
    return p;
  }
  if (typeof p === "string") {
    return p.split(".");
  }
  if (p instanceof RegExp) {
    return [p];
  }
  console.log("unparsable $path: ", p);
  throw new Error("cannot parse $path");
}
function pathString(path) {
  return Array.isArray(path) ? path.join(".") : `${path}`;
}
function combinePaths(p, p2) {
  if (!Array.isArray(p)) {
    return combinePaths(toPathArray(p), p2);
  }
  if (!Array.isArray(p2)) {
    return combinePaths(p, toPathArray(p2));
  }
  if (!p.length) {
    return p2;
  }
  if (!p2.length) {
    return p;
  }
  return [...p, ...p2];
}
const exclude = "next,isActive,value,complete".split(",");
function getAllMethodNames(obj) {
  const methods = /* @__PURE__ */ new Set();
  let current = obj;
  while (current && current !== Object.prototype) {
    Object.getOwnPropertyNames(current).forEach((name) => {
      if (name === "constructor" || /^\$/.test(name)) return;
      const descriptor = Object.getOwnPropertyDescriptor(current, name);
      if (descriptor && typeof descriptor.value === "function") {
        methods.add(name);
      }
    });
    current = Object.getPrototypeOf(current);
  }
  return Array.from(methods);
}
function bindActions(target) {
  const methodNames = getAllMethodNames(target);
  return methodNames.reduce(($, key) => {
    if (/^\$/.test(key) || exclude.includes(key) || typeof target[key] !== "function") {
      return $;
    }
    $[key] = (...args) => target[key].apply(target, args);
    return $;
  }, {});
}
enableMapSet();
class Store {
  constructor(p, noSubject = false) {
    if (!noSubject) {
      this.#subject = new BehaviorSubject(p.value);
    }
    if (p.schema) {
      this.$schema = p.schema;
    }
    this.debug = !!p.debug;
    this.#tests = p.tests ? testize(p.tests, this) : void 0;
    if (p.prep) {
      this.#prep = p.prep.bind(this);
      if (this.#subject) {
        this.#subject.next(this.prep(this.value));
      }
    }
    if (p.name && typeof p.name === "string") {
      this.#name = p.name;
    }
    if (p.res && p.res instanceof Map) {
      p.res.forEach((value, key) => this.$res.set(key, value));
    }
  }
  /**
   * note - for consistency with the types $subject is a generic $subject;
   * however internally it is a BehaviorSubject.
   * @private
   */
  #subject;
  get $subject() {
    return this.#subject;
  }
  debug;
  // more alerts on validation failures;
  #prep;
  prep(value) {
    if (this.#prep) {
      return this.#prep.call(this, value, this.value);
    }
    return value;
  }
  $res = /* @__PURE__ */ new Map();
  #name;
  get $name() {
    if (!this.#name) {
      this.#name = "forestry-store:" + `${Math.random()}`.split(".").pop();
    }
    return this.#name;
  }
  complete() {
    if (!this.isActive) {
      return this.value;
    }
    const finalValue = this.value;
    this.isActive = false;
    if (this.#subject) {
      this.#subject.complete();
    }
    return finalValue;
  }
  isActive = true;
  next(value) {
    if (!this.isActive) {
      throw new Error("Cannot update completed store");
    }
    if (!this.#subject) {
      throw new Error("Store requires $subject -- or override of next()");
    }
    const preparedValue = this.prep(value);
    const { isValid, error } = this.$validate(preparedValue);
    if (isValid) {
      if (this.#hasTrans()) {
        this.queuePendingValue(preparedValue);
      } else {
        this.#subject.next(preparedValue);
      }
      return;
    }
    if (this.debug) {
      this.$broadcast({ action: "next-error", error, value: preparedValue });
    }
    throw asError(error);
  }
  #test(fn, value) {
    const result = fn.call(this, value, this);
    if (result) {
      throw asError(result);
    }
  }
  get suspendValidation() {
    return this.#transStack.value.some((p) => p.suspendValidation);
  }
  $transact(params, suspend) {
    if (typeof params === "function") {
      this.$transact({
        action: params,
        suspendValidation: !!suspend
      });
      return;
    }
    const { action, suspendValidation } = params;
    let transId = "";
    try {
      let boundFn = function(value) {
        return action.call(self, value);
      };
      transId = this.#queuePendingTrans(suspendValidation);
      const self = this;
      boundFn(this.value);
      this.#commitTransact(transId);
    } catch (err) {
      if (transId) {
        this.#revertTransact(transId);
      }
      throw err;
    }
  }
  #transStack = new BehaviorSubject([]);
  // for debugging
  observeTransStack(listener) {
    return this.#transStack.subscribe(listener);
  }
  #commitTransact(id) {
    let changed = false;
    const nextStack = this.#transStack.value.map((p) => {
      if (p.id === id) {
        changed = true;
        return {
          ...p,
          isTransaction: false,
          suspendValidation: false
        };
      } else {
        return p;
      }
    });
    if (changed) {
      this.#transStack.next(nextStack);
    }
    this.#checkTransComplete();
  }
  #checkTransComplete() {
    if (!this.#transStack.value.some((p) => p.isTransaction)) {
      const last = this.#transStack.value.pop();
      this.#transStack.next([]);
      if (last) {
        this.$broadcast({
          action: "checkTransComplete",
          phase: "next",
          value: last.value
        });
        this.next(last.value);
      }
    }
  }
  _$;
  get $() {
    if (!this._$) {
      this._$ = bindActions(this);
    }
    return this._$;
  }
  queuePendingValue(value) {
    const digits = `${Math.random()}`.replace("0.", "");
    const id = `level_${this.#transStack.value.length}-${digits}-trans`;
    const next = [
      ...this.#transStack.value,
      {
        id,
        value,
        isTransaction: false
      }
    ];
    this.#transStack.next(next);
    return id;
  }
  #hasTrans() {
    return this.#transStack.value.some((p) => p.isTransaction);
  }
  #collapseTransStack = () => {
    if (this.#hasTrans()) {
      return;
    }
    const last = this.#transStack.value.pop();
    this.#transStack.next([]);
    return last;
  };
  dequeuePendingValue(id) {
    const queuedIndex = this.#transStack.value.findIndex((p) => p.id === id);
    if (queuedIndex === this.#transStack.value.length - 1) {
      if (!this.#transStack.value.some((p) => p.isTransaction)) {
        return this.#collapseTransStack();
      }
    }
  }
  #queuePendingTrans(suspendValidation = false) {
    const digits = `${Math.random()}`.replace("0.", "");
    const id = `level_${this.#transStack.value.length}-${digits}-trans`;
    const next = [
      ...this.#transStack.value,
      {
        id,
        value: this.value,
        suspendValidation,
        isTransaction: true
      }
    ];
    this.#transStack.next(next);
    return id;
  }
  #revertTransact(id) {
    const index = this.#transStack.value.findIndex((p) => p.id === id);
    if (index >= 0) {
      const next = this.#transStack.value.slice(0, index);
      this.#transStack.next(next);
    }
  }
  get $root() {
    return this;
  }
  get $isRoot() {
    return true;
  }
  $parent;
  $broadcast(message, fromRoot) {
    if (fromRoot || !this.$parent) {
      this.receiver.next(message);
    }
    if (this.$root && this.$root !== this) {
      this.$root.$broadcast(message);
    }
  }
  receiver = new Subject();
  // $validate determines if a value can be sent to next
  // _in the current context_
  // -- i.e., depending on on transactional conditions
  $validate(value) {
    if (this.suspendValidation) {
      return { isValid: true };
    }
    if (isZodParser(this.$schema)) {
      try {
        this.$schema.parse(value);
      } catch (err) {
        return {
          isValid: false,
          error: asError(err),
          source: "$schema"
        };
      }
    }
    return this.$test(value);
  }
  $isValid(value) {
    return this.$validate(value).isValid;
  }
  $schema;
  #tests;
  $test(value) {
    let lastFn;
    if (this.#tests) {
      try {
        if (Array.isArray(this.#tests)) {
          for (const test of this.#tests) {
            lastFn = test;
            this.#test(test, value);
          }
        } else if (typeof this.#tests === "function") {
          lastFn = this.#tests;
          this.#test(this.#tests, value);
        }
      } catch (err) {
        return {
          isValid: false,
          value,
          error: asError(err),
          testFn: lastFn
        };
      }
    }
    return {
      isValid: true
    };
  }
  get value() {
    const tsv = this.#transStack.value;
    if (tsv.length) {
      return tsv[tsv.length - 1].value;
    }
    if (!this.#subject) {
      throw new Error("Store requires $subject or overload of value");
    }
    return this.#subject.value;
  }
  subscribe(listener) {
    return this.$subject.pipe(distinctUntilChanged(isEqual)).subscribe(
      listener
    );
  }
  get(path) {
    if (!path || Array.isArray(path) && path.length === 0) {
      return this.value;
    }
    const pathArray = Array.isArray(path) ? path : pathString(path).split(".");
    return getPath(this.value, pathArray);
  }
  set(path, value) {
    const next = produce(this.value, (draft) => {
      setPath(draft, path, value);
    });
    this.next(next);
  }
  mutate(producerFn, path) {
    if (!path || Array.isArray(path) && path.length === 0) {
      const newValue = produce(this.value, producerFn);
      this.next(newValue);
      return this.value;
    } else {
      const pathArray = Array.isArray(path) ? path : pathString(path).split(".");
      const newValue = produce(this.value, (draft) => {
        const target = getPath(draft, pathArray);
        if (target !== void 0) {
          producerFn(target);
        }
      });
      this.next(newValue);
      return this.value;
    }
  }
}
class Forest extends Store {
  #parentSub;
  constructor(p) {
    const { path, parent } = p;
    const isBranch = path !== void 0 && parent !== void 0;
    if (isBranch) {
      if (!isStore(parent)) {
        throw new Error("Forest branches must have parents");
      }
      const branchValue = getPath(parent?.value, path);
      super(
        {
          ...p,
          value: branchValue
        },
        true
        // noSubject = true for branches (they use parent's subject)
      );
      this.$path = path;
      this.$parent = parent;
      this.#parentSub = parent.receiver.subscribe((message) => {
        this.handleMessage(message);
      });
    } else {
      super(p);
    }
  }
  $path = [];
  $parent;
  get $isRoot() {
    return !this.$parent;
  }
  // Get the full path from root to this branch
  get fullPath() {
    if (this.$isRoot) {
      return [];
    }
    if (!this.$parent || !this.$path) {
      throw new Error("Branch requires parent and path");
    }
    const parentFullPath = this.$parent.fullPath;
    return combinePaths(parentFullPath, this.$path);
  }
  // Override value getter for branches to get value from root using fullPath
  get value() {
    if (this.$isRoot) {
      return super.value;
    } else {
      return getPath(this.$root.value, this.fullPath);
    }
  }
  get $root() {
    if (this.$isRoot) {
      return this;
    }
    return this.$parent?.$root;
  }
  // Override complete to handle forest-wide completion
  complete() {
    if (!this.isActive) {
      return this.value;
    }
    if (this.#parentSub) {
      this.#parentSub.unsubscribe();
    }
    if (this.$isRoot) {
      const completionMessage = {
        type: "complete",
        timestamp: Date.now()
      };
      this.$broadcast(completionMessage, true);
      this.receiver.complete();
    }
    return super.complete();
  }
  // Override next to implement validation messaging system
  next(value) {
    if (!this.isActive) {
      throw new Error("Cannot update completed store");
    }
    const preparedValue = this.prep ? this.prep(value, this.value) : value;
    const { isValid, error } = this.$validate(preparedValue);
    if (!isValid) {
      if (this.debug) {
        console.error(
          `cannot update ${this.$name} with `,
          preparedValue,
          error
        );
      }
      throw asError(error);
    }
    if (this.$parent && this.$path) {
      this.$parent.set(this.$path, preparedValue);
    } else {
      const pendingId = this.queuePendingValue(preparedValue);
      try {
        this.#validatePending(preparedValue);
        const pending = this.dequeuePendingValue(pendingId);
        if (pending) {
          super.next(preparedValue);
        }
      } catch (error2) {
        this.dequeuePendingValue(pendingId);
        throw error2;
      }
    }
  }
  #validatePending(preparedValue) {
    let validationError = null;
    const transientSub = this.receiver.subscribe((message) => {
      if (message && message.type === "validation-failure") {
        validationError = `Branch ${pathString(message.branchPath)}: ${message.error}`;
      }
    });
    try {
      const setPendingMessage = {
        type: "set-pending",
        payload: preparedValue,
        timestamp: Date.now()
      };
      this.$broadcast(setPendingMessage, true);
      const validateMessage = {
        type: "$validate-all",
        timestamp: Date.now()
      };
      this.$broadcast(validateMessage, true);
      if (validationError) {
        if (this.debug) {
          console.error("Branch validation failed:", validationError);
        }
        throw new Error(`Validation failed: ${validationError}`);
      }
    } finally {
      transientSub.unsubscribe();
    }
  }
  set(path, value) {
    const pathArray = Array.isArray(path) ? path : pathString(path).split(".");
    const newValue = produce(this.value, (draft) => {
      setPath(draft, pathArray, value);
    });
    return this.next(newValue);
  }
  $branch(path, params) {
    const name = this.$name + "." + pathString(path);
    if (params.subclass) {
      return new params.subclass({
        name,
        ...params,
        path,
        parent: this
      });
    }
    return new Forest({
      name,
      ...params,
      parent: this,
      path
    });
  }
  // Branch-specific methods (from ForestBranch)
  // Handle messages from parent/root
  handleMessage(message) {
    if (message.type === "complete") {
      this.complete();
    } else if (message.type === "set-pending") {
      if (this.$parent && this.$path) {
        const newValue = getPath(this.$parent.value, this.$path);
        if (!isEqual(newValue, this.value)) {
          super.next(newValue);
        }
      }
    }
  }
  get $subject() {
    if (this.$isRoot) {
      return super.$subject;
    }
    const path = pathString(this.fullPath);
    return this.$root.$subject.pipe(
      map((value) => path ? get(value, path) : value),
      distinctUntilChanged(isEqual)
    );
  }
  subscribe(listener) {
    return this.$subject.subscribe(listener);
  }
  receiver = new Subject();
  $broadcast(message, fromRoot) {
    if (fromRoot || this.$isRoot) {
      this.receiver.next(message);
    } else if (this.$root && this.$root !== this) {
      this.$root.$broadcast(message);
    } else {
      console.warn(
        "strange $broadcast pattern; node that is not $root has no $parent",
        this
      );
    }
  }
}
export {
  Forest,
  Store
};
//# sourceMappingURL=index.js.map
