import {
  ActionDeltaArgs,
  ActionFactory,
  ActionIF,
  ActionMap,
  Cacheable,
  DataEngineIF,
  DataEngineValidatorFn,
  TreeIF,
} from "../../types";

export type DataEngineParams = {
  cacheable?: Cacheable;
  validator?: DataEngineValidatorFn;
};

export default class DataEngine implements DataEngineIF {
  constructor(public name: string, params?: DataEngineParams) {
    if (params) {
      if (params?.cacheable) {
        this.cacheable = params.cacheable;
      }
      if (params?.validator) {
        this.validator = params.validator;
      }
    }
  }

  actions: ActionMap = new Map();

  validator?: DataEngineValidatorFn;

  public tree?: TreeIF;

  private cacheable?: Cacheable;

  addAction(actOrActFactory: ActionIF | ActionFactory): DataEngine {
    if (typeof actOrActFactory === "function") {
      return this.addAction(actOrActFactory(this));
    }
    this.actions.set(actOrActFactory.name, actOrActFactory);

    if (this.tree) {
      //@ts-ignore
      this.tree.acts[actOrActFactory] = (...args: ActionDeltaArgs) =>
        this.tree!.do(actOrActFactory.name, ...args);
    }
    return this;
  }
}
