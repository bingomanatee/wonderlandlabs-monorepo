import { Store } from './Store';
import {
  BranchConfigParams,
  ForestMessage,
  Listener,
  Path,
  StoreIF,
  StoreParams,
} from '../types';
import {
  distinctUntilChanged,
  map,
  Observable,
  Subject,
  Unsubscribable,
} from 'rxjs';
import combinePaths, { pathString } from '../lib/combinePaths';
import { produce } from 'immer';
import { getPath, setPath } from '../lib/path';
import asError from '../lib/asError';
import { isStore } from '../typeguards';
import { isEqual } from 'lodash-es';
import { Branches, BranchParams } from './Branches';

export class Forest<DataType>
  extends Store<DataType>
  implements StoreIF<DataType>
{
  #parentSub?: Unsubscribable;
  #$branchParams = new Map<
    string,
    BranchConfigParams<unknown, StoreIF<unknown>> | undefined
  >();
  #$subject?: Observable<DataType>;
  public readonly $branches: Branches<DataType>;

  constructor(p: StoreParams<DataType>) {
    const { path, parent } = p;
    // Determine if this is a branch (has both path and parent) or root
    const isBranch = path !== undefined && parent !== undefined;

    if (isBranch) {
      // Handle branch construction
      if (!isStore(parent)) {
        throw new Error('Forest branches must have parents');
      }

      const branchValue = getPath(parent?.value, path) as DataType;
      super(
        {
          ...p,
          value: branchValue,
        },
        true, // noSubject = true for branches (they use parent's subject)
      );
      this.$path = path;
      this.$parent = parent;
      // Subscribe to parent messages
      this.#parentSub = parent.receiver.subscribe({
        next: (message: unknown) => {
          this.#handleMessage(message as ForestMessage);
        },
      });
    } else {
      // Handle root construction - no subject needed for branches
      super(p); // noSubject = false for roots (they need their own subject)
    }
    if (p.branchClasses instanceof Map) {
      p.branchClasses.forEach((subclass, path) => {
        this.#$branchParams.set(pathString(path), { subclass });
      });
    }
    if (p.branchParams instanceof Map) {
      p.branchParams.forEach((branchParam, path) => {
        const key = pathString(path);
        const existing = this.#$branchParams.get(key);
        if (
          existing &&
          typeof existing === 'object' &&
          !Array.isArray(existing) &&
          branchParam &&
          typeof branchParam === 'object' &&
          !Array.isArray(branchParam)
        ) {
          this.#$branchParams.set(key, {
            ...existing,
            ...branchParam,
          });
          return;
        }
        this.#$branchParams.set(key, branchParam);
      });
    }
    this.$branches = new Branches(this, this.#$branchParams);
  }

  readonly $path?: Path = [];

  get $isRoot() {
    return !this.$parent;
  }

  // Get the full path from root to this branch
  get fullPath(): Path {
    if (this.$isRoot) {
      return [];
    }
    if (!this.$parent || !this.$path) {
      throw new Error('Branch requires parent and path');
    }

    // Recursively build the full path through the parent branch chain.
    const parentFullPath = (this.$parent as Forest<unknown>).fullPath;
    return combinePaths(parentFullPath, this.$path);
  }

  // Override value getter for branches to get value from root using fullPath
  get value(): DataType {
    if (this.$isRoot) {
      // Root: use parent Store implementation
      return super.value;
    } else {
      // Branch: get value from root at our full path
      return getPath(this.$root.value, this.fullPath) as DataType;
    }
  }

  get $root(): this {
    if (this.$isRoot) {
      return this;
    }
    return this.$parent!.$root as this;
  }

  // Override complete to handle forest-wide completion
  complete(): DataType {
    if (!this.isActive) {
      return this.value;
    }

    // Clean up branch subscription if this is a branch
    if (this.#parentSub) {
      this.#parentSub.unsubscribe();
    }

    if (!this.$isRoot) {
      this.$branches.$completeAll();
    }

    this.#removeFromParentRegistry();

    // If this is root, send completion message to all branches
    if (this.$isRoot) {
      const completionMessage: ForestMessage = {
        type: 'complete',
        timestamp: Date.now(),
      };
      this.$broadcast(completionMessage, true);

      // Complete the receiver subject
      this.receiver.complete();
    }

    this.$branches.clear();

    // Call parent complete method
    return super.complete();
  }

  // Override next to implement validation messaging system
  next(value: Partial<DataType>) {
    if (!this.isActive) {
      throw new Error('Cannot update completed store');
    }

    // Apply prep function if it exists.
    const preparedValue = this.prep(value);

    // First validate using Store's validation
    const { isValid, error } = this.$validate(preparedValue);
    if (!isValid) {
      if (this.debug) {
        console.error(
          `cannot update ${this.$name} with `,
          preparedValue,
          error,
        );
      }
      throw asError(error);
    }

    // Handle branch vs root behavior
    if (this.$parent && this.$path) {
      // Branch: update parent at our path
      this.$parent.set(this.$path, preparedValue);
    } else {
      // Root: use pending validation system
      const pendingId = this.queuePendingValue(preparedValue);

      try {
        this.#validatePending(preparedValue);
        const pending = this.dequeuePendingValue(pendingId);
        if (pending) {
          super.next(preparedValue);
        }
      } catch (error) {
        this.dequeuePendingValue(pendingId);
        throw error;
      }
    }
  }

  #validatePending(preparedValue: DataType) {
    if (this.suspendValidation) {
      return;
    }

    // Step 1: Create transient listener for validation failures
    const validationErrors: string[] = [];
    const transientSub = this.receiver.subscribe((message: any) => {
      if (message && message.type === 'validation-failure') {
        validationErrors.push(
          `Branch ${pathString(message.branchPath)}: ${message.error}`,
        );
      }
    });

    try {
      // Step 2: Send setPending message to all branches
      const setPendingMessage: ForestMessage = {
        type: 'set-pending',
        payload: preparedValue,
        timestamp: Date.now(),
      };
      this.$broadcast(setPendingMessage, true);

      const validateMessage: ForestMessage = {
        type: '$validate-all',
        payload: preparedValue,
        timestamp: Date.now(),
      };
      this.$broadcast(validateMessage, true);
      if (validationErrors.length) {
        const message = validationErrors.join('; ');
        if (this.debug) {
          console.error('Branch validation failed:', message);
        }
        throw new Error(`Validation failed: ${message}`);
      }
    } finally {
      transientSub.unsubscribe();
    }
  }

  set(path: Path, value: unknown): void {
    const filteredPath = this.filterPath(path);
    const newValue = produce(this.value, (draft) => {
      // Use Immer to safely set nested values
      setPath(draft, filteredPath, value);
    });
    this.next(newValue);
  }

  $branch<Type, Subclass extends StoreIF<Type> = StoreIF<Type>>(
    path: Path,
    params: BranchParams<Type, Subclass>,
    ...rest: unknown[]
  ): Subclass {
    console.warn('$branch is deprecated; use this.$branches.$add');
    return this.$branches.$add(path, params, ...rest);
  }

  get $br() {
    return this.$branches;
  }

  // Branch-specific methods (from ForestBranch)

  // Handle messages from parent/root
  #handleMessage(message: ForestMessage) {
    if (message.type === 'complete') {
      this.complete();
    } else if (message.type === 'set-pending') {
      // Update our value if the parent changed our path
      if (this.$parent && this.$path) {
        const newValue = getPath(this.$parent.value, this.$path) as DataType;
        if (!isEqual(newValue, this.value)) {
          super.next(newValue);
        }
      }
    } else if (message.type === '$validate-all') {
      this.#validateBranch(message);
      this.receiver.next(message);
    }
  }

  #validateBranch(message: ForestMessage) {
    if (this.$isRoot) {
      return;
    }
    const rootValue = Object.hasOwn(message, 'payload')
      ? message.payload
      : this.$root.value;
    const branchValue = getPath(rootValue, this.fullPath) as DataType;
    if (branchValue === undefined) {
      return;
    }
    const { isValid, error } = this.$validate(branchValue);
    if (isValid) {
      return;
    }
    const validationMessage: ForestMessage = {
      type: 'validation-failure',
      branchPath: this.fullPath,
      error: asError(error).message,
      timestamp: Date.now(),
    };
    this.$root.receiver.next(validationMessage);
  }

  #removeFromParentRegistry() {
    if (!this.$path || !(this.$parent instanceof Forest)) {
      return;
    }
    const parent = this.$parent as Forest<unknown>;
    const key = pathString(this.$path);
    const sibling = parent.$branches.get(key);
    if (sibling === (this as unknown as StoreIF<unknown>)) {
      parent.$branches.$detach(key, sibling);
    }
  }

  get $subject(): Observable<DataType> {
    if (this.$isRoot) {
      return super.$subject;
    }
    if (this.#$subject) {
      return this.#$subject;
    }
    this.#$subject = this.$root.$subject.pipe(
      map(() => this.value),
      distinctUntilChanged(isEqual),
    );
    return this.#$subject;
  }

  subscribe(listener: Listener<DataType>) {
    return this.$subject.subscribe(listener);
  }

  public receiver = new Subject();

  public $broadcast(message: unknown, fromRoot?: boolean) {
    if (fromRoot || this.$isRoot) {
      this.receiver.next(message);
    } else if (this.$root && this.$root !== this) {
      this.$root.$broadcast(message);
    } else {
      console.warn(
        'strange $broadcast pattern; node that is not $root has no $parent',
        this,
      );
    }
  }
}
