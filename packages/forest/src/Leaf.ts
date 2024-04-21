import { BranchIF, LeafConfig, LeafIF } from './types';
import { type } from '@wonderlandlabs/walrus';
import { isLeafConfig } from './helpers';

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

  public name: string;
  public config: LeafConfig;

  get value() {
    return this.branch.get(this.name);
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
}
