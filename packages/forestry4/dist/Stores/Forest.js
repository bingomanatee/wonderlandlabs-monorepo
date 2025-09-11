import { Store } from "./Store.js";
import { Subject } from "rxjs";
import { pathString } from "../lib/combinePaths.js";
import { produce } from "immer";
import { ForestBranch } from "./ForestBranch.js";
import { setPath } from "../lib/path.js";
import asError from "../lib/asError.js";
class Forest extends Store {
  constructor(p) {
    super(p);
  }
  path = [];
  parent = null;
  isRoot = true;
  get root() {
    return this;
  }
  broadcast(message, fromRoot) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    }
    if (this.parent) {
      this.parent.broadcast(message);
    }
  }
  receiver = new Subject();
  // Override complete to handle forest-wide completion
  complete() {
    if (!this.isActive) {
      return this.value;
    }
    const completionMessage = {
      type: "complete",
      timestamp: Date.now()
    };
    this.broadcast(completionMessage, true);
    this.receiver.complete();
    return super.complete();
  }
  // Override next to implement validation messaging system
  next(value) {
    const preparedValue = this.prep ? this.prep(value, this.value) : value;
    const { isValid, error } = this.validate(preparedValue);
    if (!isValid) {
      if (this.debug) {
        console.error(`cannot update ${this.name} with `, preparedValue, error);
      }
      throw asError(error);
    }
    const pendingId = this.queuePendingValue(preparedValue);
    try {
      this.#validatePending(preparedValue);
    } finally {
      const pending = this.dequeuePendingValue(pendingId);
      if (pending) {
        super.next(pending.value);
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
      this.broadcast(setPendingMessage, true);
      const validateMessage = {
        type: "validate-all",
        timestamp: Date.now()
      };
      this.broadcast(validateMessage, true);
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
  branch(path, params) {
    const name = this.name + "." + pathString(path);
    return new ForestBranch(
      {
        name,
        ...params
      },
      path,
      this
    );
  }
}
export {
  Forest
};
//# sourceMappingURL=Forest.js.map
