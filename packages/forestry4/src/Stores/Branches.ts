import { BranchConfigParams, Path, StoreIF, StoreParams } from '../types';
import { Subscription } from 'rxjs';
import { pathString } from '../lib/combinePaths';
import { Forest } from './Forest';

export type BranchParams<
  ValueType,
  Subclass extends StoreIF<ValueType> = StoreIF<ValueType>,
> = Omit<StoreParams<ValueType, Subclass>, 'value'>;

export class Branches extends Map<string, StoreIF<unknown>> {
  #forest: Forest<unknown>;
  #$branchParams: Map<
    string,
    BranchConfigParams<unknown, StoreIF<unknown>> | undefined
  >;
  #sub?: Subscription;

  constructor(
    forest: Forest<unknown>,
    branchParams: Map<
      string,
      BranchConfigParams<unknown, StoreIF<unknown>> | undefined
    >,
  ) {
    super();
    this.#forest = forest;
    this.#$branchParams = branchParams;
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

  $add<ValueType, Subclass extends StoreIF<ValueType> = StoreIF<ValueType>>(
    path: Path,
    params: BranchParams<ValueType, Subclass>,
    ...rest: unknown[]
  ): Subclass {
    const key = this.#key(path);
    const existing = super.get(key);
    if (existing) {
      throw new Error(`Branch already exists at ${key}`);
    }
    const sourceValue = this.#forest.get(key);
    if (sourceValue === undefined) {
      throw new Error(`Cannot create branch at ${key}; value is undefined`);
    }

    const paramsWithoutRuntime = this.#omitRuntimeParams(params);
    const nextParams = this.#resolveBranchParams(path, paramsWithoutRuntime);

    const name = this.#forest.$name + '.' + key;
    const branchValue = sourceValue as ValueType;
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

  #resolveBranchParams<
    ValueType,
    Subclass extends StoreIF<ValueType> = StoreIF<ValueType>,
  >(
    path: Path,
    params: BranchParams<ValueType, Subclass>,
  ): BranchParams<ValueType, Subclass> {
    const key = this.#key(path);
    const hasExplicitSubclass = Object.hasOwn(params, 'subclass');
    const configured = this.#resolveConfiguredParams(path);
    const merged = {
      ...(configured?.params ?? {}),
      ...params,
    } as BranchParams<ValueType, Subclass>;

    if (hasExplicitSubclass) {
      merged.subclass = this.#validateSubclass(params.subclass, key);
      return merged;
    }

    if (configured && Object.hasOwn(configured.params, 'subclass')) {
      merged.subclass = this.#validateSubclass(
        merged.subclass,
        key,
        configured.source,
      );
    }

    return merged;
  }

  #resolveConfiguredParams(path: Path): {
    params: BranchParams<unknown, StoreIF<unknown>>;
    source: string;
  } | undefined {
    const key = this.#key(path);
    let source = '';
    let rawParams: unknown;

    if (this.#$branchParams.has(key)) {
      source = `branchParams["${key}"]`;
      rawParams = this.#$branchParams.get(key);
    } else if (this.#$branchParams.has('*')) {
      source = 'branchParams["*"]';
      rawParams = this.#$branchParams.get('*');
    } else {
      return undefined;
    }

    if (!rawParams) {
      console.warn(
        `Branch params provided for "${key}" in ${source} but do not exist`,
      );
      return { params: {} as BranchParams<unknown, StoreIF<unknown>>, source };
    }

    if (typeof rawParams !== 'object' || Array.isArray(rawParams)) {
      console.warn(`Branch params provided for "${key}" in ${source} are invalid`);
      return { params: {} as BranchParams<unknown, StoreIF<unknown>>, source };
    }

    return {
      params: this.#omitRuntimeParams(
        rawParams as BranchParams<unknown, StoreIF<unknown>>,
      ),
      source,
    };
  }

  #validateSubclass<Subclass extends StoreIF<unknown> = StoreIF<unknown>>(
    branchClass: unknown,
    key: string,
    source?: string,
  ): (new (...args: any[]) => Subclass) | undefined {
    if (!branchClass) {
      if (source) {
        console.warn(
          `Branch class provided for "${key}" in ${source} but does not exist`,
        );
      } else {
        console.warn(`Branch class provided for "${key}" but does not exist`);
      }
      return undefined;
    }
    if (typeof branchClass !== 'function') {
      if (source) {
        console.warn(`Branch class provided for "${key}" in ${source} is invalid`);
      } else {
        console.warn(`Branch class provided for "${key}" is invalid`);
      }
      return undefined;
    }
    return branchClass as new (...args: any[]) => Subclass;
  }

  #omitRuntimeParams<
    ValueType,
    Subclass extends StoreIF<ValueType> = StoreIF<ValueType>,
  >(
    params: BranchParams<ValueType, Subclass>,
  ): BranchParams<ValueType, Subclass> {
    const next = {
      ...params,
    } as BranchParams<ValueType, Subclass> & {
      value?: unknown;
      path?: Path;
      parent?: StoreIF<unknown>;
    };
    if (Object.hasOwn(next, 'value')) {
      delete next.value;
    }
    if (Object.hasOwn(next, 'path')) {
      delete next.path;
    }
    if (Object.hasOwn(next, 'parent')) {
      delete next.parent;
    }
    return next as BranchParams<ValueType, Subclass>;
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
