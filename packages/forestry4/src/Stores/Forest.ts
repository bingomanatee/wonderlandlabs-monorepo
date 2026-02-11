import { Store } from './Store';
import { ForestMessage, Listener, Path, StoreIF, StoreParams } from '../types';
import { map, Observable, Subject, Subscription, Unsubscribable } from 'rxjs';
import combinePaths, { pathString } from '../lib/combinePaths';
import { produce } from 'immer';
import { getPath, setPath } from '../lib/path';
import asError from '../lib/asError';
import { isStore } from '../typeguards';
import { isEqual } from 'lodash-es';
import { distinctUntilChanged } from 'rxjs/operators';

type BranchParams<
  ValueType,
  Subclass extends StoreIF<ValueType> = StoreIF<ValueType>,
> = Omit<StoreParams<ValueType, Subclass>, 'value'>;

class Branches extends Map<string, StoreIF<unknown>> {
  #forest: Forest<unknown>;
  #$branchClasses: Map<string, unknown>;
  #sub?: Subscription;

  constructor(
    forest: Forest<unknown>,
    branchClasses: Map<string, unknown>,
  ) {
    super();
    this.#forest = forest;
    this.#$branchClasses = branchClasses;
  }

  #key(path: Path) {
    return pathString(path);
  }

  $get<ValueType, Subclass extends StoreIF<ValueType> = StoreIF<ValueType>>(
    path: Path,
  ): Subclass | undefined {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing) {
      return existing as Subclass;
    }
    if (this.#forest.get(key) === undefined) {
      return undefined;
    }
    this.$add(key, {});
    return super.get(key) as Subclass | undefined;
  }

  override has(path: Path): boolean {
    return super.has(this.#key(path));
  }

  override set(path: Path, value: StoreIF<unknown>): this {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing && existing !== value) {
      throw new Error(`Branch already exists at ${key}`);
    }
    super.set(key, value);
    this.#ensureSub();
    return this;
  }

  override delete(path: Path): boolean {
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

  override clear(): void {
    super.clear();
    this.#clearSubIfEmpty();
  }

  $add<
    ValueType,
    Subclass extends StoreIF<ValueType> = StoreIF<ValueType>,
  >(
    path: Path,
    params: BranchParams<ValueType, Subclass>,
    ...rest: unknown[]
  ): Subclass {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing) {
      throw new Error(`Branch already exists at ${key}`);
    }

    const paramsWithoutValue = {
      ...params,
    } as BranchParams<ValueType, Subclass> & { value?: unknown };
    if (Object.hasOwn(paramsWithoutValue, 'value')) {
      delete paramsWithoutValue.value;
    }

    const subclass = this.#resolveSubclass(path, paramsWithoutValue);
    const nextParams =
      subclass && !paramsWithoutValue.subclass
        ? ({
            ...paramsWithoutValue,
            subclass: subclass as BranchParams<ValueType, Subclass>['subclass'],
          } as BranchParams<ValueType, Subclass>)
        : paramsWithoutValue;

    const name = this.#forest.$name + '.' + key;
    const branchValue = getPath(this.#forest.value, key) as ValueType;
    let branch: Subclass;
    if (nextParams.subclass) {
      branch = new nextParams.subclass(
        {
          name,
          value: branchValue,
          ...nextParams,
          path,
          parent: this.#forest as StoreIF<unknown>,
        },
        ...rest,
      );
    } else {
      // note -- will not have rest props
      branch = new Forest<ValueType>({
        name,
        value: branchValue,
        ...nextParams,
        parent: this.#forest as StoreIF<unknown>,
        path,
      }) as unknown as Subclass;
    }

    this.set(key, branch as unknown as StoreIF<unknown>);

    if (this.#forest.get(key) === undefined) {
      this.delete(key);
    }

    return branch;
  }

  $detach(path: Path, expected?: StoreIF<unknown>): boolean {
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

  #resolveSubclass<
    ValueType,
    Subclass extends StoreIF<ValueType> = StoreIF<ValueType>,
  >(
    path: Path,
    params: BranchParams<ValueType, Subclass>,
  ): BranchParams<ValueType, Subclass>['subclass'] {
    const key = this.#key(path);
    const hasExplicitSubclass = Object.hasOwn(params, 'subclass');

    if (hasExplicitSubclass) {
      const provided = params.subclass;
      if (!provided) {
        console.warn(`Branch class provided for "${key}" but does not exist`);
        return undefined;
      }
      if (typeof provided !== 'function') {
        console.warn(`Branch class provided for "${key}" is invalid`);
        return undefined;
      }
      return provided;
    }

    let source = '';
    let branchClass: unknown = undefined;
    let provided = false;
    if (this.#$branchClasses.has(key)) {
      source = `branchClasses["${key}"]`;
      branchClass = this.#$branchClasses.get(key);
      provided = true;
    } else if (this.#$branchClasses.has('*')) {
      source = 'branchClasses["*"]';
      branchClass = this.#$branchClasses.get('*');
      provided = true;
    }

    if (!provided) {
      return undefined;
    }
    if (!branchClass) {
      console.warn(
        `Branch class provided for "${key}" in ${source} but does not exist`,
      );
      return undefined;
    }
    if (typeof branchClass !== 'function') {
      console.warn(`Branch class provided for "${key}" in ${source} is invalid`);
      return undefined;
    }
    return branchClass as BranchParams<ValueType, Subclass>['subclass'];
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
      if (this.#forest.get(key) === undefined) {
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
      this.#sub = undefined;
    }
  }
}

export class Forest<DataType>
  extends Store<DataType>
  implements StoreIF<DataType>
{
  #parentSub?: Unsubscribable;
  #$branchClasses = new Map<string, unknown>();
  public readonly $branches: Branches;

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
      p.branchClasses.forEach((branchClass, path) => {
        this.#$branchClasses.set(pathString(path), branchClass);
      });
    }
    this.$branches = new Branches(
      this as unknown as Forest<unknown>,
      this.#$branchClasses,
    );
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

    // Apply prep function if it exists to transform partial input to complete data
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

  set(path: Path, value: unknown): void {
    const pathArray = Array.isArray(path) ? path : pathString(path).split('.');
    const newValue = produce(this.value, (draft) => {
      // Use Immer to safely set nested values
      setPath(draft, pathArray, value);
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

  $getBranch<Type, Subclass extends StoreIF<Type> = StoreIF<Type>>(
    path: Path,
  ): Subclass | undefined {
    return this.$branches.get(pathString(path)) as Subclass | undefined;
  }

  $removeBranch(path: Path): boolean {
    return this.$branches.delete(path);
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
    }
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
    const self = this;
    return this.$root.$subject.pipe(
      map(() => self.value),
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
