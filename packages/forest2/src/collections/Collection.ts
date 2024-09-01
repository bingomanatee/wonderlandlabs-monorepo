import { Forest } from "../Forest";
import type { CollectionIF } from "../type.collection";
import type { SubscribeFn } from "../types.shared";
import type { ForestIF } from "../types.forest";
import type { TreeIF, ValidatorFn } from "../types.trees";
import type { ChangeFN } from "../types.branch";
import type { PartialObserver } from "rxjs";

export type CollectionParams<ValueType> = {
  initial?: ValueType;
  validator?: ValidatorFn<ValueType>;
  actions?: Map<string, ChangeFN<ValueType>>;
};

export abstract class Collection<ValueType> implements CollectionIF<ValueType> {
  constructor(
    public name: string,
    private params?: CollectionParams<ValueType>,
    forest?: ForestIF
  ) {
    this.forest = forest ?? new Forest();
    if (this.forest.hasTree(name)) {
      throw new Error("cannot create collection - tree " + name + " exists");
    }

    this.forest.addTree(name, {
      initial: params?.initial,
      validator: params?.validator,
    });
  }

  get value(): ValueType {
    return this.tree.value;
  }

  next(next: ValueType): CollectionIF<ValueType> {
    this.tree.grow({ next });
    return this;
  }

  mutate<SeedType>(next: ChangeFN<ValueType>, seed?: SeedType) {
    this.tree.grow({next, seed}) // untested
    return this;
  }

  protected get subject () {
    return this.tree.subject
  }

  subscribe(observer: PartialObserver<ValueType> | SubscribeFn<ValueType>) {
    return this.subject.subscribe(observer);
  }

  public forest: ForestIF;

  protected get tree(): TreeIF<ValueType> {
    const tree = this.forest.tree<ValueType>(this.name);
    if (!tree) throw new Error("cannot find tree " + this.name);
    return tree;
  }
}
