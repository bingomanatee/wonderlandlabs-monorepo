import {
  ActionExposedRecord,
  Listener,
  Path,
  StoreBranch,
  ForestMessage,
  BranchParams,
} from '../types';
import { Store } from './Store';
import { isStore } from '../typeguards';
import { get, isEqual } from 'lodash-es';
import combinePaths, { pathString } from '../lib/combinePaths';
import { map, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { produce } from 'immer';
import { getPath, setPath } from '../lib/path';

/**
 * ForestBranch is a shard store for a forest;
 * it cannot be the root and it always must have parent and path.
 */
export class ForestBranch<DataType, Actions extends ActionExposedRecord = ActionExposedRecord>
  extends Store<DataType, Actions>
  implements StoreBranch<DataType, Actions>
{
  constructor(
    p: BranchParams<DataType, Actions>,
    public readonly path: Path,
    public readonly parent: StoreBranch<unknown>
  ) {
    if (!isStore(parent)) {
      throw new Error('ForestBranches must have parents');
    }

    const branchValue = getPath(parent.value, path) as DataType;
    super(
      {
        ...p,
        value: branchValue,
      },
      true
    );

    this.#parentSub = parent.receiver.subscribe((message) => {
      this.handleMessage(message);
    });
  }

  #parentSub: Subscription;

  // Handle messages from parent/root
  private handleMessage(message: any): void {
    if (message && typeof message === 'object' && message.type) {
      const forestMessage = message as ForestMessage;

      switch (forestMessage.type) {
        case 'set-pending':
          this.setPendingFromRoot(forestMessage.payload);
          break;
        case 'validate-all':
          this.validateAndReport();
          // Clear pending value after validation
          this.clearPending();
          break;
        case 'complete':
          // Complete this branch when receiving complete message
          this.complete();
          break;
      }
    }

    // Continue broadcasting to children
    this.broadcast(message, true);
  }

  // Set pending value from root's new value
  private setPendingFromRoot(rootValue: any): void {
    const pendingValue = getPath(rootValue, this.path) as DataType;
    this.setPending(pendingValue);
  }

  // Override value getter to return pending value during validation or parent value
  get value(): DataType {
    if (this.hasPending()) {
      return this.pending!;
    }
    return getPath(this.parent?.value, this.path) as DataType;
  }

  // Validate current state and report failures to root
  private validateAndReport(): void {
    const { isValid, error } = this.validate(this.value);

    if (!isValid) {
      // Send validation failure message upstream
      const failureMessage: ForestMessage = {
        type: 'validation-failure',
        branchPath: this.path,
        error: typeof error === 'string' ? error : error?.toString() || 'Unknown validation error',
        timestamp: Date.now(),
      };

      // Broadcast the failure message upstream (don't use fromRoot=true)
      this.broadcast(failureMessage);
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

  next(value: Partial<DataType>): boolean {
    if (!this.isActive) {
      throw new Error('Cannot update completed store');
    }

    // Apply prep function if it exists to transform partial input to complete data
    const preparedValue = this.prep
      ? this.prep(value, this.value, this.initialValue)
      : (value as DataType);

    // Calculate what the new root value would be
    const newRootValue = produce(this.parent.value, (draft) => {
      setPath(draft, this.path, preparedValue);
    });

    // Use the root's next method which will handle validation of all branches
    return this.root.next(newRootValue);
  }

  get subject() {
    const path = pathString(this.path);
    return this.parent.subject.pipe(
      map((value) => get(value, path)),
      distinctUntilChanged(isEqual)
    );
  }

  subscribe(listener: Listener<DataType>) {
    return this.subject.subscribe(listener);
  }

  set(value: unknown, path: Path): boolean {
    if (this.parent) {
      const deepPath = combinePaths(this.path, path);
      return this.parent.set(value, deepPath);
    } else {
      // should be in Forest class instance but just in case:
      // Use Immer to create immutable update
      const pathArray = Array.isArray(path) ? path : pathString(path).split('.');
      const newValue = produce(this.value, (draft) => {
        setPath(draft, pathArray, value);
      });
      return this.next(newValue);
    }
  }

  public receiver = new Subject();

  public broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || this.isRoot) {
      this.receiver.next(message);
    } else if (this.parent) {
      this.parent.broadcast(message);
    } else {
      console.warn('strange broadcast pattern; node that is not root has no parent');
    }
  }

  branch<Type, BranchActions extends ActionExposedRecord = ActionExposedRecord>(
    path: Path,
    params: BranchParams<Type, BranchActions>
  ) {
    const mergedPath = combinePaths(this.path, path);
    const name = this.name + '.' + pathString(path);
    return new ForestBranch<Type, BranchActions>(
      {
        name,
        ...params,
      },
      mergedPath,
      this // Use this branch as parent, not root
    );
  }

  // Override complete to handle branch-specific completion
  complete(): DataType {
    if (!this.isActive) {
      return this.value; // Multiple completes have no effect
    }

    // Send completion message to sub-branches
    const completionMessage: ForestMessage = {
      type: 'complete',
      timestamp: Date.now(),
    };
    this.broadcast(completionMessage, true);

    // Complete this branch (sets isActive to false)
    const finalValue = super.complete();

    // Complete the receiver subject after broadcasting
    this.receiver.complete();

    // Clean up parent subscription
    this.#parentSub.unsubscribe();

    return finalValue;
  }

  // Clean up when branch is destroyed
  destroy(): void {
    this.#parentSub.unsubscribe();
  }
}
