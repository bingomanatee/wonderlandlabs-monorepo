import { BehaviorSubject } from "rxjs";
import { isEqual } from "lodash-es";
import asError from "../lib/asError.js";
import { isZodParser } from "../typeguards.js";
import { enableMapSet, produce } from "immer";
import { methodize, testize } from "./helpers.js";
import { getPath } from "../lib/path.js";
import { pathString } from "../lib/combinePaths.js";
import { distinctUntilChanged } from "../node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js";
enableMapSet();
class Store {
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
  constructor(p, noSubject = false) {
    const processedValue = p.prep ? p.prep({}, p.value, p.value) : p.value;
    if (!noSubject) {
      this.#subject = new BehaviorSubject(processedValue);
    }
    if ("schema" in p && p.schema) {
      this.schema = p.schema;
    }
    this.debug = !!p.debug;
    const self = this;
    this.$ = methodize(p.actions ?? {}, self);
    if (p.tests) {
      this.tests = testize(p.tests, self);
    }
    this.prep = p.prep;
    if (p.name && typeof p.name === "string") {
      this.#name = p.name;
    }
    if (p.res && p.res instanceof Map) {
      p.res.forEach((value, key) => this.res.set(key, value));
    }
  }
  debug;
  // more alerts on validation failures;
  prep;
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
    this.clearPending();
    return finalValue;
  }
  isActive = true;
  pending;
  _hasPending = false;
  next(value) {
    if (!this.isActive) {
      throw new Error("Cannot update completed store");
    }
    const preparedValue = this.prep ? this.prep(value, this.value) : value;
    const { isValid, error } = this.validate(preparedValue);
    if (!this.subject) {
      throw new Error("Store requires subject -- or override of next()");
    }
    if (isValid) {
      this.#subject.next(preparedValue);
      return;
    }
    if (this.debug) {
      console.error(
        "cannot update ",
        this.name,
        "with",
        value,
        "(current: ",
        this.value,
        ")",
        error
      );
    }
    throw asError(error);
  }
  #test(fn, value) {
    const result = fn(value, this);
    if (result) {
      throw asError(result);
    }
  }
  validate(value) {
    try {
      if (isZodParser(this.schema)) {
        this.schema.parse(value);
      }
      if (this.tests) {
        if (Array.isArray(this.tests)) {
          for (const test of this.tests) {
            this.#test(test, value);
          }
        } else if (typeof this.tests === "function") {
          this.#test(this.tests, value);
        } else {
          throw new Error(
            "bad value for tests - must be function or array of functions"
          );
        }
      }
      return {
        isValid: true
      };
    } catch (e) {
      return {
        isValid: false,
        error: asError(e)
      };
    }
  }
  isValid(value) {
    return this.validate(value).isValid;
  }
  schema;
  tests;
  // Pending value management
  setPending(value) {
    if (this._hasPending) {
      throw new Error("cannot overwrite a pending value");
    }
    this.pending = value;
    this._hasPending = true;
  }
  hasPending() {
    return this._hasPending;
  }
  clearPending() {
    this.pending = void 0;
    this._hasPending = false;
  }
  get value() {
    if (this._hasPending) {
      return this.pending;
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
