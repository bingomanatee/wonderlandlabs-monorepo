import { Store } from "./Store.js";
import { isStore } from "../typeguards.js";
import { get, isEqual } from "lodash-es";
import combinePaths, { pathString } from "../lib/combinePaths.js";
import { map, Subject } from "rxjs";
import { produce } from "immer";
import { getPath, setPath } from "../lib/path.js";
import { distinctUntilChanged } from "../node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js";
class ForestBranch extends Store {
  constructor(p, path, parent) {
    if (!isStore(parent)) {
      throw new Error("ForestBranches must have parents");
    }
    const branchValue = getPath(parent.value, path);
    super(
      {
        ...p,
        value: branchValue
      },
      true
    );
    this.path = path;
    this.parent = parent;
    this.#parentSub = parent.receiver.subscribe((message) => {
      this.handleMessage(message);
    });
  }
  #parentSub;
  // Handle messages from parent/root
  handleMessage(message) {
    if (message && typeof message === "object" && message.type) {
      const forestMessage = message;
      switch (forestMessage.type) {
        case "validate-all":
          this.validateAndReport();
          break;
        case "complete":
          this.complete();
          break;
      }
    }
    this.broadcast(message, true);
  }
  // Override value getter to return pending value during validation or parent value
  get value() {
    return getPath(this.parent?.value, this.path);
  }
  // Validate current state and report failures to root
  validateAndReport() {
    const { isValid, error } = this.validate(this.value);
    if (!isValid) {
      const failureMessage = {
        type: "validation-failure",
        branchPath: this.path,
        error: typeof error === "string" ? error : error?.toString() || "Unknown validation error",
        timestamp: Date.now()
      };
      this.root.broadcast(failureMessage);
    }
  }
  get root() {
    let root = this.parent;
    while (!root.isRoot && root.parent) {
      root = root.parent;
    }
    return root;
  }
  get isRoot() {
    return !this.parent;
  }
  next(value) {
    if (!this.isActive) {
      throw new Error("Cannot update completed store");
    }
    const preparedValue = this.prep ? this.prep(value, this.value) : value;
    const { isValid, error } = this.validate(preparedValue);
    if (!isValid) {
      throw error;
    }
    if (this.parent) {
      this.parent.set(this.path, preparedValue);
    } else {
      super.next(preparedValue);
    }
  }
  get subject() {
    const path = pathString(this.path);
    return this.parent.subject.pipe(
      map((value) => get(value, path)),
      distinctUntilChanged(isEqual)
    );
  }
  subscribe(listener) {
    return this.subject.subscribe(listener);
  }
  set(path, value) {
    if (this.parent) {
      const deepPath = combinePaths(this.path, path);
      return this.parent.set(deepPath, value);
    } else {
      const pathArray = Array.isArray(path) ? path : pathString(path).split(".");
      const newValue = produce(this.value, (draft) => {
        setPath(draft, pathArray, value);
      });
      return this.next(newValue);
    }
  }
  receiver = new Subject();
  broadcast(message, fromRoot) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    } else if (this.root && this.root !== this) {
      this.root.broadcast(message);
    } else {
      console.warn(
        "strange broadcast pattern; node that is not root has no parent"
      );
    }
  }
  branch(path, params) {
    const mergedPath = combinePaths(this.path, path);
    const name = this.name + "." + pathString(path);
    return new ForestBranch(
      {
        name,
        ...params
      },
      mergedPath,
      this
      // Use this branch as parent, not root
    );
  }
  // Override complete to handle branch-specific completion
  complete() {
    if (!this.isActive) {
      return this.value;
    }
    const completionMessage = {
      type: "complete",
      timestamp: Date.now()
    };
    this.broadcast(completionMessage, true);
    const finalValue = super.complete();
    this.receiver.complete();
    this.#parentSub.unsubscribe();
    return finalValue;
  }
  // Clean up when branch is destroyed
  destroy() {
    this.#parentSub.unsubscribe();
  }
}
export {
  ForestBranch
};
//# sourceMappingURL=ForestBranch.js.map
