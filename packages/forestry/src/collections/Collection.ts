import { Forest } from '../Forest';
import type { CollectionIF } from '../types/type.collection';
import type { SubscribeFn, UpdaterValueProviderFN, ValueProviderFN } from '../types/types.shared';
import type { ForestIF } from '../types/types.forest';
import type { TreeIF } from '../types/types.trees';
import type { PartialObserver } from 'rxjs';
import { upperFirst } from 'lodash-es';
import type { CollectionParams } from './types.collections';

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

  next(next: ValueType, name: string) {
    this.tree.next(next, name);
  }

  revise<ParamType = unknown>(name: string, seed?: ParamType) {
    const fn =
      this.params?.revisions instanceof Map
        ? this.params?.revisions?.get(name)
        : this.params?.revisions?.[name];
    if (!fn) {
      throw new Error('cannot perform revision ' + name + '; not in connection');
    }

    this.forest.do(() => {
      this.update<ParamType>(fn, seed);
    });
  }

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

  public forest: ForestIF;

  public get tree(): TreeIF<ValueType> {
    const tree = this.forest.tree<ValueType>(this.name);
    if (!tree) {
      throw new Error('cannot find tree ' + this.name);
    }
    return tree;
  }

  private actionNames(): string[] {
    if (this.params?.actions) {
      if (this.params?.actions instanceof Map) {
        return [...this.params.actions.keys()].filter((a) => typeof a === 'string');
      } else {
        return [...Object.keys(this.params.actions)].filter((a) => typeof a === 'string');
      }
    } else {
      return [];
    }
  }
  superClassMe(superClassName: string, typeName: string, includeImports = true) {
    return `
   ${includeImports ? 'import {Collection, Forest } from "@wonderlandlabs/forestry";' : ''}
    ${this.actionNames().map(actionTypeTemplate)}
    
   export class ${superClassName} extends Collection<${typeName}> {

        constructor(f?: Forest) {
          super('${this.name}', {/** insert base collection params here */}, f);
        }

        ${this.actionNames().map(actionsTemplate)}

          // insert custom selectors here 

    }`;
  }
}

function actionTypeTemplate(name: string) {
  return `
    type ${upperFirst(name)}Param = {/**param def here; delete this line if no arguments */}
  `;
}

function actionsTemplate(name: string) {
  return `
  ${name}(seed: ${upperFirst(name)}Param) {
    return this.act('${name}', seed);
  }
`;
}
