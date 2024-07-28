import {
  MutatorArgs,
  MutationFactcory,
  MutatorIF,
  MutatorMap,
  Cacheable,
  EngineIF,
  EngineValidatorFn,
  TreeIF,
} from "../types";

export type DataEngineParams = {
  cacheable?: Cacheable;
  validator?: EngineValidatorFn;
};

export default class DataEngine implements EngineIF {
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

  actions: MutatorMap = new Map();

  validator?: EngineValidatorFn;

  public tree?: TreeIF;

  private cacheable?: Cacheable;

  addAction(actOrActFactory: MutatorIF | MutationFactcory): DataEngine {
    if (typeof actOrActFactory === "function") {
      return this.addAction(actOrActFactory(this));
    }
    this.actions.set(actOrActFactory.name, actOrActFactory);

    if (this.tree) {
      //@ts-ignore
      this.tree.mut[actOrActFactory] = (...args: MutatorArgs) =>
        this.tree!.mutate(actOrActFactory.name, ...args);
    }
    return this;
  }
}
