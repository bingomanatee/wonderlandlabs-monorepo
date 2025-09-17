import { Store } from './Store';
import {
  Path,
  StoreParams,
  StoreBranch,
  ForestMessage,
  BranchParams,
  Listener,
} from '../types';
import { Subject, Subscription, map } from 'rxjs';
import { pathString } from '../lib/combinePaths';
import { produce } from 'immer';
import { setPath, getPath } from '../lib/path';
import asError from '../lib/asError';
import { isStore } from '../typeguards';
import { get, isEqual } from 'lodash-es';
import { distinctUntilChanged } from 'rxjs/operators';
import combinePaths from '../lib/combinePaths';

export class Forest<DataType>
  extends Store<DataType>
  implements StoreBranch<DataType>
{
  #parentSub?: Subscription;

  constructor(p: StoreParams<DataType>);
  constructor(
    p: BranchParams<DataType>,
    $path: Path,
    $parent: StoreBranch<unknown>,
  );
  constructor(
    p: StoreParams<DataType> | BranchParams<DataType>,
    public readonly $path?: Path,
    public readonly $parent?: StoreBranch<unknown>,
  ) {
    // Determine if this is a branch (has both path and parent) or root
    const isBranch = $path !== undefined && $parent !== undefined;

    if (isBranch) {
      // Handle branch construction
      if (!isStore($parent)) {
        throw new Error('Forest branches must have parents');
      }

      const branchValue = getPath($parent.value, $path) as DataType;
      super(
        {
          ...p,
          value: branchValue,
        },
        true, // noSubject = true for branches (they use parent's subject)
      );

      // Subscribe to parent messages
      this.#parentSub = $parent.receiver.subscribe((message) => {
        this.handleMessage(message);
      });
    } else {
      // Handle root construction - no subject needed for branches
      super(p as StoreParams<DataType>, false); // noSubject = false for roots (they need their own subject)

      // Ensure root properties are set correctly
      (this as any).$path = [];
      (this as any).$parent = undefined;
    }
  }

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

    // Recursively build the full path by combining parent's fullPath with our relative path
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

  get $root(): StoreBranch<unknown> {
    if (this.$isRoot) {
      return this;
    }
    return this.$parent!.$root;
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

    // Call parent complete method
    return super.complete();
  }

  // Override next to implement validation messaging system
  next(value: Partial<DataType>) {
    if (!this.isActive) {
      throw new Error('Cannot update completed store');
    }

    // Apply prep function if it exists to transform partial input to complete data
    const preparedValue = this.prep
      ? this.prep(value, this.value!)
      : (value as DataType);

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
      this.$broadcast(setPendingMessage, true);

      const validateMessage: ForestMessage = {
        type: '$validate-all',
        timestamp: Date.now(),
      };
      this.$broadcast(validateMessage, true);
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

  $branch<Type, Subclass extends StoreBranch<Type> = StoreBranch<Type>>(
    path: Path,
    params: BranchParams<Type, Subclass>,
  ): Subclass {
    const name = this.$name + '.' + pathString(path);
    if (params.subclass) {
      return new params.subclass(
        {
          name,
          ...params,
        },
        path,
        this,
      );
    }
    return new Forest<Type>(
      {
        name,
        ...params,
      },
      path,
      this,
    ) as unknown as Subclass;
  }

  // Branch-specific methods (from ForestBranch)

  // Handle messages from parent/root
  private handleMessage(message: ForestMessage) {
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
    }
  }

  get $subject() {
    if (this.$isRoot) {
      return super.$subject;
    }
    const path = pathString(this.fullPath);
    return this.$root.$subject.pipe(
      map((value) => (path ? get(value, path) : value) as DataType),
      distinctUntilChanged(isEqual),
    );
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
