import { Forest } from './../Forest';
import {
  MutationValueProviderFN,
  ObserverOrSubscribeFn,
  UpdaterValueProviderFN,
} from './../types/types.shared';
import type { ForestIF } from './../types/types.forest';
import type { TreeIF, TreeParams } from './../types/types.trees';
import type { CollectionIF } from './../types/types.collections';

import { ControllerActions, collectionActions } from './collectionActions';

export class Collection<ValueType> implements CollectionIF<ValueType> {
  constructor(
    public name: string,
    public params: TreeParams<ValueType>,
    public actions: ControllerActions<any>,
    public forest: ForestIF = new Forest(),
  ) {
    this.tree = this.forest.addTree(name, params);
    this.acts = collectionActions(this, actions);
  }

  get value(): ValueType {
    return this.tree.value;
  }

  next(next: ValueType, name?: string) {
    this.tree.next(next, name);
  }

  readonly tree: TreeIF<(typeof this)['params']['initial']>;
  readonly acts: Record<string, (...args: any[]) => any>;
  mutate<SeedType>(
    mutator: MutationValueProviderFN<ValueType, SeedType>,
    seed?: SeedType,
    name: string = '(mutate)',
  ) {
    this.tree.mutate<SeedType>(mutator, seed, name);
  }

  update<ParamType = unknown>(
    updaterFn: UpdaterValueProviderFN<ValueType, ParamType>,
    seed?: ParamType,
  ) {
    const mutator: MutationValueProviderFN<ValueType, ParamType> = ({
      value,
      seed,
    }) => updaterFn(value, seed);
    this.tree.mutate(mutator, seed);
  }

  protected get subject() {
    return this.tree.subject;
  }

  subscribe(observer: ObserverOrSubscribeFn<ValueType>) {
    return this.tree.subscribe(observer);
  }

  observe(observer: ObserverOrSubscribeFn<ValueType>) {
    return this.tree.observe(observer);
  }
}
