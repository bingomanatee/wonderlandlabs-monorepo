import { BehaviorSubject, distinctUntilChanged, switchMap } from 'rxjs'
import { Schema } from './Schema'
import { c } from '@wonderlandlabs/collect'
import { TreeClass } from './TreeClass'
import { v4 } from 'uuid'
import { LeafObj, LeafOpts, SchemaProps, SchemaTuple, Tree } from './types'
import isEqual from 'lodash.isequal'
import { cascadeUpdatesToChildren, childrenToSubject } from './utils'

export class Leaf<ValueType> implements LeafObj<ValueType> {
  constructor(value: ValueType,
              public $options: SchemaProps,
              public $parent?: LeafObj<any>,
  ) {
    this.$subject = new BehaviorSubject(value);
    this.$id = v4()
    const com = c(value);

    $options.fields?.forEach((tuple: SchemaTuple) => {
      // @TODO: make lazy?
      let childValue = undefined;
      if ('value' in tuple) {
        childValue = tuple.value;
      } else if (com.hasKey(tuple.name)) {
        childValue = com.get(tuple.name);
      } else if ('defaultValue' in tuple.schema) {
        childValue = tuple.schema.defaultValue;
      }
      const child = new Leaf<any>(childValue, tuple.schema, this);
      this.$addChild(schema.name, child);
    });

    cascadeUpdatesToChildren(this);
    this.$tree = $parent?.$tree || new TreeClass(this);
  }

  public $id: string;

  public $tree: Tree

  public $subject: BehaviorSubject<ValueType>

  get $value() {
    return this.$composedSubject.value;
  }

  // @ts-ignore

  private $_composedSubject?: BehaviorSubject<ValueType>;

  public get $composedSubject(): BehaviorSubject<ValueType> {
    if (!this.$_composedSubject) {
      this.$_composedSubject = new BehaviorSubject(this.$subject.value);
      this.$_childSubject.pipe(
        switchMap((children) => {
          return childrenToSubject(this.$subject, children)
        }),
        distinctUntilChanged(isEqual)
      ).subscribe(this.$_composedSubject);
    }
    return this.$_composedSubject;
  }

  set $value(newValue) {
    this.$tree.update(this.$id, newValue);
  }

  public $children?: Map<KeyType, LeafObj<any>>;

  $addChild(key: any, leaf: LeafObj<any>) {
    if (!this.$children) {
      this.$children = new Map();
    }
    this.$children.set(key, leaf);
    this.$_childSubject.next(this.$children);
  }

  /**
   * updated every time the child collection changes.
   */
  private $__childSubject?: BehaviorSubject<Map<any, LeafObj<any>> | undefined>

  private get $_childSubject() {
    if (!this.$__childSubject) {
      this.$__childSubject = new BehaviorSubject(this.$children);
    }
    return this.$__childSubject;
  }

  $child(key: any): any {
    return this.$children?.get(key);
  }

  $complete() {
    this.$subject.complete();
    this.$children?.forEach((child) => child.$complete());
  }

  $blockUpdateToChildren: boolean = false;
  $blockUpdateToParent: boolean = false;
}
