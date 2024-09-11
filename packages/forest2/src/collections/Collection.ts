import { Forest } from '../Forest';
import type { CollectionIF } from '../types/type.collection';
import type { SubscribeFn } from '../types/types.shared';
import type { ForestIF } from '../types/types.forest';
import type { TreeIF, TreeParams, ValidatorFn } from '../types/types.trees';
import type { ChangeFN } from '../types/types.branch';
import type { PartialObserver } from 'rxjs';

export type CollectionParams<ValueType> = TreeParams<ValueType> & {
  actions?: Map<string, ChangeFN<ValueType>>;
  reuseTree?: boolean;
};

export class Collection<ValueType> implements CollectionIF<ValueType> {
  constructor(
    public name: string,
    private params?: CollectionParams<ValueType>,
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
        throw new Error('cannot create collection - tree ' + name + ' exists');
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
    const fn = this.params?.actions?.get(name);
    if (!fn)
    {throw new Error('cannot perform action ' + name + ': not in colletion');}
    return this.forest.do(() => {
      this.mutate(fn, name, seed);
    });
  }

  next(next: ValueType, name: string): CollectionIF<ValueType> {
    this.tree.next(next, name);
    return this;
  }

  mutate<SeedType>(
    mutator: ChangeFN<ValueType>,
    name: string,
    seed?: SeedType
  ) {
    this.tree.grow({ mutator, name, seed }); 
    return this;
  }

  protected get subject() {
    return this.tree.subject;
  }

  subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>) {
    return this.subject.subscribe(observer);
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
