import {
  BranchIF,
  DoMethod,
  LeafConfig,
  LeafConfigDoMethod,
  LeafIF,
  SubscribeListener,
} from './types';
import { type } from '@wonderlandlabs/walrus';
import { isLeafConfig } from './helpers';
import { c } from '@wonderlandlabs/collect';
import { map } from 'rxjs';

export default class Leaf implements LeafIF {
  constructor(
    public branch: BranchIF,
    config: LeafConfig | string,
    name: string
  ) {
    this.name = name;
    if (typeof config === 'string') {
      config = { type: config };
    }

    if (isLeafConfig(config)) {
      this.config = config;
    } else {
      console.warn('bad leaf config', name, config);
      throw new Error('mis-configured leaf');
    }
  }

  get forest() {
    return this.branch.forest;
  }

  public name: string;
  public config: LeafConfig;

  get value() {
    return this.branch.get(this.name);
  }

  set value(value: unknown) {
    this.branch.set(this.name, value);
  }

  validate() {
    const value = this.value;
    if (this.config.required === false) {
      if (value === undefined || value === null) {
        // missing values are allowed - terminate validation
        return;
      }
    }
    if (this.config.type) {
      const valueType = type.describe(value, true);
      if (valueType !== this.config.type && this.config.strict !== false) {
        console.warn(
          'with base',
          this.branch.value,
          this.name,
          '--- type issue; ',
          valueType,
          'is not a ',
          this.config.type
        );
        throw new Error(
          'field' + this.name + ' must be of type ' + this.config.type
        );
      }
    }
    if (this.config.validate) {
      this.config.validate(value, this);
    }
  }

  get observable() {
    return this.branch.observable.pipe(
      map((value) => {
        return this.branch.get(this.name);
      })
    );
  }

  subscribe(listener: SubscribeListener) {
    return this.observable.subscribe(listener);
  }

  report() {
    return {
      type: 'leaf',
      value: this.value,
      name: this.name,
      parent: this.branch.forestId,
    };
  }

  // ------------------- actions ------------------------

  do: Record<string, DoMethod> = {};

  _initDo() {
    this.do = {};

    if (this.config.actions) {
      c(this.config.actions).forEach((fn: LeafConfigDoMethod, name: string) => {
        this.do[name] = (...args) => {
          this.forest.trans(name, () => {
            fn(this, ...args);
          });
        };
      });
    }
  }
}
