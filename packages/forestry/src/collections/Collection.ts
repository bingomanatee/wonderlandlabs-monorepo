import { Forest } from '../Forest';
import type {
  SubscribeFn,
  UpdaterValueProviderFN,
  ValueProviderFN,
} from '../types/types.shared';
import type { ForestIF } from '../types/types.forest';
import type { TreeIF, TreeParams } from '../types/types.trees';
import type { PartialObserver } from 'rxjs';
import type { CollectionIF } from '../types/types.collections';

import { ControllerActions, collectionActions } from './collectionActions';

export class Collection<ValueType> implements CollectionIF<ValueType> {
  constructor(
    public name: string,
    public params: TreeParams<ValueType>,
    public actions: ControllerActions<any>,
    public forest: ForestIF = new Forest()
  ) {
    this.tree = this.forest.addTree(name, params);
    this.acts = collectionActions(this, actions);
  }

  get value(): ValueType {
    return this.tree.value;
  }

  next(next: ValueType, name: string) {
    this.tree.next(next, name);
  }

  readonly tree: TreeIF<(typeof this)['params']['initial']>;
  readonly acts: Record<string, (...args: any[]) => any>;
  mutate<SeedType>(
    mutator: ValueProviderFN<ValueType, SeedType>,
    seed?: SeedType,
    name: string = '(mutate)'
  ) {
    this.tree.mutate<SeedType>(mutator, seed, name);
  }

  update<ParamType = unknown>(
    updaterFn: UpdaterValueProviderFN<ValueType, ParamType>,
    seed?: ParamType
  ) {
    this.tree.mutate(({ value }) => updaterFn(value, seed));
  }

  protected get subject() {
    return this.tree.subject;
  }

  subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>) {
    return this.forest.observe(this.tree.name).subscribe(observer);
  }
}
