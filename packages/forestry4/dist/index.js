import { BehaviorSubject, Subject, distinctUntilChanged, map } from "rxjs";
import { isEqual } from "lodash-es";
import { enableMapSet, produce } from "immer";
import { type, TypeEnum } from "@wonderlandlabs/walrus";
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
    const node = current;
    switch (currentType) {
      case TypeEnum.map:
        return node.get(pathSegment);
      case TypeEnum.array: {
        if (typeof pathSegment === "number") {
          return node[pathSegment];
        }
        const index = Number.parseInt(String(pathSegment), 10);
        if (isNaN(index)) {
          return void 0;
        }
        return node[index];
      }
      case TypeEnum.object:
        return node[pathSegment];
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
  let target = draft;
  for (const pathSegment of path.slice(0, path.length - 1)) {
    const currentType = type.describe(target, true);
    const node2 = target;
    switch (currentType) {
      case TypeEnum.map:
        if (!node2.has(pathSegment)) {
          node2.set(pathSegment, {});
        }
        target = node2.get(pathSegment);
        break;
      case TypeEnum.array: {
        const index = typeof pathSegment === "number" ? pathSegment : Number.parseInt(String(pathSegment), 10);
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${pathSegment}`);
        }
        if (node2[index] === void 0) {
          node2[index] = {};
        }
        target = node2[index];
        break;
      }
      case TypeEnum.object:
        if (node2[pathSegment] === void 0 || node2[pathSegment] === null) {
          node2[pathSegment] = {};
        }
        target = node2[pathSegment];
        break;
      default:
        throw new Error(`Cannot set nested value on type: ${currentType}`);
    }
  }
  const finalKey = path[path.length - 1];
  const finalType = type.describe(target, true);
  const node = target;
  switch (finalType) {
    case TypeEnum.map:
      node.set(finalKey, value);
      break;
    case TypeEnum.array:
      if (typeof finalKey === "number") {
        node[finalKey] = value;
      } else {
        const index = Number.parseInt(String(finalKey), 10);
        if (isNaN(index)) {
          throw new Error(`Invalid array index: ${finalKey}`);
        }
        node[index] = value;
      }
      break;
    case TypeEnum.object:
      node[finalKey] = value;
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
  console.log("unparsable $path: ", p);
  throw new Error("cannot parse $path");
}
function pathString(path) {
  return Array.isArray(path) ? path.map(String).join(".") : path;
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
const requiredMethod = {
  get: "get",
  set: "set"
};
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
  const methodNames = /* @__PURE__ */ new Set([
    ...getAllMethodNames(target),
    ...Object.values(requiredMethod)
  ]);
  return Array.from(methodNames).reduce(($, key) => {
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
    if (p.filterPath) {
      this.#filterPath = p.filterPath;
    }
  }
  /**
   * note - for consistency with the types $subject is a generic $subject;
   * however internally it is a BehaviorSubject.
   * @private
   */
  #subject;
  #filterPath;
  get $subject() {
    return this.#subject;
  }
  filterPath(path) {
    return this.#filterPath ? this.#filterPath(path, this) : path;
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
      this.$broadcast({
        action: "next-error",
        error,
        input: value,
        value: preparedValue
      });
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
  get $bound() {
    return this.$;
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
  $parent = void 0;
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
    const filteredPath = this.filterPath(path);
    const pathArray = Array.isArray(filteredPath) ? filteredPath : pathString(filteredPath).split(".");
    return getPath(this.value, pathArray);
  }
  set(path, value) {
    const filteredPath = this.filterPath(path);
    const next = produce(this.value, (draft) => {
      setPath(draft, filteredPath, value);
    });
    this.next(next);
  }
  mutate(producerFn, path) {
    if (!path || Array.isArray(path) && path.length === 0) {
      const newValue = produce(this.value, producerFn);
      this.next(newValue);
      return this.value;
    } else {
      const filteredPath = this.filterPath(path);
      const pathArray = Array.isArray(filteredPath) ? filteredPath : pathString(filteredPath).split(".");
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
class Branches extends Map {
  #forest;
  #$branchParams;
  #sub;
  constructor(forest, branchParams) {
    super();
    this.#forest = forest;
    this.#$branchParams = branchParams;
  }
  #key(path) {
    return pathString(path);
  }
  $get(path) {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing) {
      return existing;
    }
    if (this.#forest.get(key) === void 0) {
      return void 0;
    }
    this.$add(key, {});
    return super.get(key);
  }
  has(path) {
    return super.has(this.#key(path));
  }
  set(path, value) {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing && existing !== value) {
      throw new Error(`Branch already exists at ${key}`);
    }
    super.set(key, value);
    this.#ensureSub();
    return this;
  }
  delete(path) {
    const key = this.#key(path);
    const branch = super.get(key);
    if (!branch) {
      return false;
    }
    const deleted = this.$detach(key, branch);
    if (deleted && branch.isActive) {
      branch.complete();
    }
    return deleted;
  }
  clear() {
    super.clear();
    this.#clearSubIfEmpty();
  }
  $add(path, params, ...rest) {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing) {
      throw new Error(`Branch already exists at ${key}`);
    }
    const sourceValue = this.#forest.get(key);
    if (sourceValue === void 0) {
      throw new Error(`Cannot create branch at ${key}; value is undefined`);
    }
    const paramsWithoutRuntime = this.#omitRuntimeParams(params);
    const nextParams = this.#resolveBranchParams(path, paramsWithoutRuntime);
    const name = this.#forest.$name + "." + key;
    const branchValue = sourceValue;
    let branch;
    if (nextParams.subclass) {
      branch = new nextParams.subclass(
        {
          name,
          value: branchValue,
          ...nextParams,
          path,
          parent: this.#forest
        },
        ...rest
      );
    } else {
      branch = new Forest({
        name,
        value: branchValue,
        ...nextParams,
        parent: this.#forest,
        path
      });
    }
    this.set(key, branch);
    return branch;
  }
  $detach(path, expected) {
    const key = this.#key(path);
    const current = super.get(key);
    if (!current) {
      return false;
    }
    if (expected && expected !== current) {
      return false;
    }
    const deleted = super.delete(key);
    this.#clearSubIfEmpty();
    return deleted;
  }
  $completeAll() {
    for (const key of [...super.keys()]) {
      this.delete(key);
    }
  }
  #resolveBranchParams(path, params) {
    const key = this.#key(path);
    const hasExplicitSubclass = Object.hasOwn(params, "subclass");
    const configured = this.#resolveConfiguredParams(path);
    const merged = {
      ...configured?.params ?? {},
      ...params
    };
    if (hasExplicitSubclass) {
      merged.subclass = this.#validateSubclass(params.subclass, key);
      return merged;
    }
    if (configured && Object.hasOwn(configured.params, "subclass")) {
      merged.subclass = this.#validateSubclass(
        merged.subclass,
        key,
        configured.source
      );
    }
    return merged;
  }
  #resolveConfiguredParams(path) {
    const key = this.#key(path);
    let source = "";
    let rawParams;
    if (this.#$branchParams.has(key)) {
      source = `branchParams["${key}"]`;
      rawParams = this.#$branchParams.get(key);
    } else if (this.#$branchParams.has("*")) {
      source = 'branchParams["*"]';
      rawParams = this.#$branchParams.get("*");
    } else {
      return void 0;
    }
    if (!rawParams) {
      console.warn(
        `Branch params provided for "${key}" in ${source} but do not exist`
      );
      return { params: {}, source };
    }
    if (typeof rawParams !== "object" || Array.isArray(rawParams)) {
      console.warn(
        `Branch params provided for "${key}" in ${source} are invalid`
      );
      return { params: {}, source };
    }
    return {
      params: this.#omitRuntimeParams(
        rawParams
      ),
      source
    };
  }
  #validateSubclass(branchClass, key, source) {
    if (!branchClass) {
      if (source) {
        console.warn(
          `Branch class provided for "${key}" in ${source} but does not exist`
        );
      } else {
        console.warn(`Branch class provided for "${key}" but does not exist`);
      }
      return void 0;
    }
    if (typeof branchClass !== "function") {
      if (source) {
        console.warn(
          `Branch class provided for "${key}" in ${source} is invalid`
        );
      } else {
        console.warn(`Branch class provided for "${key}" is invalid`);
      }
      return void 0;
    }
    return branchClass;
  }
  #omitRuntimeParams(params) {
    const next = {
      ...params
    };
    if (Object.hasOwn(next, "value")) {
      delete next.value;
    }
    if (Object.hasOwn(next, "path")) {
      delete next.path;
    }
    if (Object.hasOwn(next, "parent")) {
      delete next.parent;
    }
    return next;
  }
  #ensureSub() {
    if (this.#sub || !this.size) {
      return;
    }
    this.#sub = this.#forest.$subject.subscribe(() => {
      this.#pruneUndefined();
    });
  }
  #pruneUndefined() {
    if (!this.size) {
      this.#clearSubIfEmpty();
      return;
    }
    for (const key of [...super.keys()]) {
      if (this.#forest.get(key) === void 0) {
        this.delete(key);
      }
    }
    this.#clearSubIfEmpty();
  }
  #clearSubIfEmpty() {
    if (this.size) {
      return;
    }
    if (this.#sub) {
      this.#sub.unsubscribe();
      this.#sub = void 0;
    }
  }
}
class Forest extends Store {
  #parentSub;
  #$branchParams = /* @__PURE__ */ new Map();
  #$subject;
  $branches;
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
      this.#parentSub = parent.receiver.subscribe({
        next: (message) => {
          this.#handleMessage(message);
        }
      });
    } else {
      super(p);
    }
    if (p.branchClasses instanceof Map) {
      p.branchClasses.forEach((subclass, path2) => {
        this.#$branchParams.set(pathString(path2), { subclass });
      });
    }
    if (p.branchParams instanceof Map) {
      p.branchParams.forEach((branchParam, path2) => {
        const key = pathString(path2);
        const existing = this.#$branchParams.get(key);
        if (existing && typeof existing === "object" && !Array.isArray(existing) && branchParam && typeof branchParam === "object" && !Array.isArray(branchParam)) {
          this.#$branchParams.set(key, {
            ...existing,
            ...branchParam
          });
          return;
        }
        this.#$branchParams.set(key, branchParam);
      });
    }
    this.$branches = new Branches(this, this.#$branchParams);
  }
  $path = [];
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
    return this.$parent.$root;
  }
  // Override complete to handle forest-wide completion
  complete() {
    if (!this.isActive) {
      return this.value;
    }
    if (this.#parentSub) {
      this.#parentSub.unsubscribe();
    }
    if (!this.$isRoot) {
      this.$branches.$completeAll();
    }
    this.#removeFromParentRegistry();
    if (this.$isRoot) {
      const completionMessage = {
        type: "complete",
        timestamp: Date.now()
      };
      this.$broadcast(completionMessage, true);
      this.receiver.complete();
    }
    this.$branches.clear();
    return super.complete();
  }
  // Override next to implement validation messaging system
  next(value) {
    if (!this.isActive) {
      throw new Error("Cannot update completed store");
    }
    const preparedValue = this.prep(value);
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
    if (this.suspendValidation) {
      return;
    }
    const validationErrors = [];
    const transientSub = this.receiver.subscribe((message) => {
      if (message && message.type === "validation-failure") {
        validationErrors.push(
          `Branch ${pathString(message.branchPath)}: ${message.error}`
        );
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
        payload: preparedValue,
        timestamp: Date.now()
      };
      this.$broadcast(validateMessage, true);
      if (validationErrors.length) {
        const message = validationErrors.join("; ");
        if (this.debug) {
          console.error("Branch validation failed:", message);
        }
        throw new Error(`Validation failed: ${message}`);
      }
    } finally {
      transientSub.unsubscribe();
    }
  }
  set(path, value) {
    const filteredPath = this.filterPath(path);
    const newValue = produce(this.value, (draft) => {
      setPath(draft, filteredPath, value);
    });
    this.next(newValue);
  }
  $branch(path, params, ...rest) {
    console.warn("$branch is deprecated; use this.$branches.$add");
    return this.$branches.$add(path, params, ...rest);
  }
  get $br() {
    return this.$branches;
  }
  // Branch-specific methods (from ForestBranch)
  // Handle messages from parent/root
  #handleMessage(message) {
    if (message.type === "complete") {
      this.complete();
    } else if (message.type === "set-pending") {
      if (this.$parent && this.$path) {
        const newValue = getPath(this.$parent.value, this.$path);
        if (!isEqual(newValue, this.value)) {
          super.next(newValue);
        }
      }
    } else if (message.type === "$validate-all") {
      this.#validateBranch(message);
      this.receiver.next(message);
    }
  }
  #validateBranch(message) {
    if (this.$isRoot) {
      return;
    }
    const rootValue = Object.hasOwn(message, "payload") ? message.payload : this.$root.value;
    const branchValue = getPath(rootValue, this.fullPath);
    if (branchValue === void 0) {
      return;
    }
    const { isValid, error } = this.$validate(branchValue);
    if (isValid) {
      return;
    }
    const validationMessage = {
      type: "validation-failure",
      branchPath: this.fullPath,
      error: asError(error).message,
      timestamp: Date.now()
    };
    this.$root.receiver.next(validationMessage);
  }
  #removeFromParentRegistry() {
    if (!this.$path || !(this.$parent instanceof Forest)) {
      return;
    }
    const parent = this.$parent;
    const key = pathString(this.$path);
    const sibling = parent.$branches.get(key);
    if (sibling === this) {
      parent.$branches.$detach(key, sibling);
    }
  }
  get $subject() {
    if (this.$isRoot) {
      return super.$subject;
    }
    if (this.#$subject) {
      return this.#$subject;
    }
    this.#$subject = this.$root.$subject.pipe(
      map(() => this.value),
      distinctUntilChanged(isEqual)
    );
    return this.#$subject;
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
