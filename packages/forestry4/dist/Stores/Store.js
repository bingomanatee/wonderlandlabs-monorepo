import { BehaviorSubject, Subject } from "rxjs";
import { isEqual } from "lodash-es";
import asError from "../lib/asError.js";
import { isZodParser } from "../typeguards.js";
import { enableMapSet, produce } from "immer";
import { methodize, testize } from "./helpers.js";
import { getPath, setPath } from "../lib/path.js";
import { pathString } from "../lib/combinePaths.js";
import { distinctUntilChanged } from "../node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js";
enableMapSet();
class Store {
  constructor(p, noSubject = false) {
    if (!noSubject) {
      this.#subject = new BehaviorSubject(p.value);
    }
    if ("schema" in p && p.schema) {
      this.schema = p.schema;
    }
    this.debug = !!p.debug;
    const self = this;
    this.$ = methodize(p.actions ?? {}, self);
    this.#tests = p.tests ? testize(p.tests, self) : void 0;
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
      p.res.forEach((value, key) => this.res.set(key, value));
    }
  }
  /**
   * note - for consistency with the types subject is a generic subject;
   * however internally it is a BehaviorSubject.
   * @private
   */
  #subject;
  get subject() {
    return this.#subject;
  }
  $;
  get acts() {
    return this.$;
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
  res = /* @__PURE__ */ new Map();
  #name;
  get name() {
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
    if (!this.subject) {
      throw new Error("Store requires subject -- or override of next()");
    }
    const preparedValue = this.prep(value);
    const { isValid, error } = this.validate(preparedValue);
    if (isValid) {
      if (this.#hasTrans()) {
        this.queuePendingValue(preparedValue);
      } else {
        this.#subject.next(preparedValue);
      }
      return;
    }
    if (this.debug) {
      this.broadcast({ action: "next-error", error, value: preparedValue });
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
  transact(params, suspend) {
    if (typeof params === "function") {
      this.transact({
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
        this.broadcast({
          action: "checkTransComplete",
          phase: "next",
          value: last.value
        });
        this.next(last.value);
      }
    }
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
  get root() {
    return this;
  }
  get isRoot() {
    return true;
  }
  parent;
  broadcast(message, fromRoot) {
    if (fromRoot || !this.parent) {
      this.receiver.next(message);
    }
    if (this.root && this.root !== this) {
      this.root.broadcast(message);
    }
  }
  receiver = new Subject();
  // validate determines if a value can be sent to next
  // _in the current conteext_
  // -- i.e., depending on on transactional conditions
  validate(value) {
    if (this.suspendValidation) {
      return { isValid: true };
    }
    if (isZodParser(this.schema)) {
      try {
        this.schema.parse(value);
      } catch (err) {
        return {
          isValid: false,
          error: asError(err),
          source: "schema"
        };
      }
    }
    return this.test(value);
  }
  isValid(value) {
    return this.validate(value).isValid;
  }
  schema;
  #tests;
  test(value) {
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
      throw new Error("Store requires subject or overload of value");
    }
    return this.#subject.value;
  }
  subscribe(listener) {
    return this.subject.pipe(distinctUntilChanged(isEqual)).subscribe(
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
export {
  Store
};
//# sourceMappingURL=Store.js.map
