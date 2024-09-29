import { Forest } from '../Forest';
import type { CollectionAction, CollectionIF } from '../types/type.collection';
import type { ChangeIF, SubscribeFn, ValueProviderFN } from '../types/types.shared';
import type { ForestIF } from '../types/types.forest';
import type { TreeIF, TreeParams } from '../types/types.trees';
import type { PartialObserver } from 'rxjs';

export type CollectionParams<
  ValueType,
  CollectionType = CollectionIF<ValueType>,
> = TreeParams<ValueType> & {
  actions?:
    | Map<string, CollectionAction<ValueType, CollectionType>>
    | Record<string, CollectionAction<ValueType, CollectionType>>;
  reuseTree?: boolean;
};

export class Collection<ValueType, SelfClass = CollectionIF<ValueType>>
implements CollectionIF<ValueType>
{
  constructor(
    public name: string,
    private params?: CollectionParams<ValueType, SelfClass>,
    forest?: ForestIF
  ) {
    this.forest = forest ?? new Forest();

    if (this.forest.hasTree(name)) {
      if (params?.reuseTree) {
        if (params.validator || params.initial) {
          throw new Error(
            'reused tree cannot have validator/initial value - tree exists already and cannot be redefined'
          );
        }
        // otherwise, allow Collection to exist
        return;
      } else {
        throw new Error('cannot create collection - tree ' + name + ' exi');
      }
    } else {
      if (params) {
        const { actions, ...rest } = params;

        this.forest.addTree(name, rest);
      } else {
        this.forest.addTree(name);
      }
    }
  }

  get value(): ValueType {
    return this.tree.value;
  }

  act(name: string, seed?: unknown) {
    const fn =
      this.params?.actions instanceof Map
        ? this.params?.actions?.get(name)
        : this.params?.actions?.[name];
    if (!fn) {
      throw new Error('cannot perform action ' + name + ': not in colletion');
    }
    // @ts-expect-error
    const collection = this as SelfClass;
    return this.forest.do(() => {
      return fn(collection, seed);
    });
  }

  next(next: ValueType, name: string): CollectionIF<ValueType> {
    this.tree.next(next, name);
    return this;
  }

  mutate<SeedType>(mutator: ValueProviderFN<ValueType>, name: string, seed?: SeedType) {
    const change: ChangeIF<ValueType> = {
      name,
      seed,
      mutator,
    };
    this.tree.grow(change);
    return this;
  }

  protected get subject() {
    return this.tree.subject;
  }

  subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>) {
    return this.forest.observe(this.tree.name).subscribe(observer);
  }

  public forest: ForestIF;

  public get tree(): TreeIF<ValueType> {
    const tree = this.forest.tree<ValueType>(this.name);
    if (!tree) {
      throw new Error('cannot find tree ' + this.name);
    }
    return tree;
  }
}
