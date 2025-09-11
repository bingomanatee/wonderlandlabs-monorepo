import { Store } from './Store';
import {
  ActionExposedRecord,
  Path,
  StoreParams,
  StoreBranch,
  ForestMessage,
  BranchParams,
} from '../types';
import { Subject } from 'rxjs';
import { pathString } from '../lib/combinePaths';
import { produce } from 'immer';
import { ForestBranch } from './ForestBranch';
import { setPath } from '../lib/path';
import asError from '../lib/asError';

export class Forest<
    DataType,
    Actions extends ActionExposedRecord = ActionExposedRecord,
  >
  extends Store<DataType, Actions>
  implements StoreBranch<DataType, Actions>
{
  constructor(p: StoreParams<DataType, Actions>) {
    super(p);
  }

  path: Path = [];
  parent?: StoreBranch<unknown> = null;
  isRoot = true;

  get root() {
    return this;
  }

  public broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    }
    if (this.parent) {
      this.parent.broadcast(message);
    }
  }

  public receiver = new Subject();

  // Override complete to handle forest-wide completion
  complete(): DataType {
    if (!this.isActive) {
      return this.value;
    }

    // Send completion message to all branches before completing
    const completionMessage: ForestMessage = {
      type: 'complete',
      timestamp: Date.now(),
    };
    this.broadcast(completionMessage, true);

    // Complete the receiver subject
    this.receiver.complete();

    // Call parent complete method
    return super.complete();
  }

  // Override next to implement validation messaging system
  next(value: Partial<DataType>) {
    // Prevent concurrent validation

    // Apply prep function if it exists to transform partial input to complete data
    const preparedValue = this.prep
      ? this.prep(value, this.value!)
      : (value as DataType);

    // First validate using Store's validation
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

  #validatePending(preparedValue: DataType) {
    // Step 1: Create transient listener for validation failures
    let validationError: string | null = null;
    const transientSub = this.receiver.subscribe((message: any) => {
      if (message && message.type === 'validation-failure') {
        validationError = `Branch ${pathString(message.branchPath)}: ${message.error}`;
      }
    });

    try {
      // Step 2: Send setPending message to all branches
      const setPendingMessage: ForestMessage = {
        type: 'set-pending',
        payload: preparedValue,
        timestamp: Date.now(),
      };
      this.broadcast(setPendingMessage, true);

      const validateMessage: ForestMessage = {
        type: 'validate-all',
        timestamp: Date.now(),
      };
      this.broadcast(validateMessage, true);
      if (validationError) {
        if (this.debug) {
          console.error('Branch validation failed:', validationError);
        }
        throw new Error(`Validation failed: ${validationError}`);
      }
    } finally {
      transientSub.unsubscribe();
    }
  }

  set(path: Path, value: unknown): boolean {
    const pathArray = Array.isArray(path) ? path : pathString(path).split('.');
    const newValue = produce(this.value, (draft) => {
      // Use Immer to safely set nested values
      setPath(draft, pathArray, value);
    });
    return this.next(newValue);
  }

  branch<Type, BranchActions extends ActionExposedRecord = ActionExposedRecord>(
    path: Path,
    params: BranchParams<Type, BranchActions>,
  ) {
    const name = this.name + '.' + pathString(path);
    return new ForestBranch<Type, BranchActions>(
      {
        name,
        ...params,
      },
      path,
      this,
    );
  }
}
