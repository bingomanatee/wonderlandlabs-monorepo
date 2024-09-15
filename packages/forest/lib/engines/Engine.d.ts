import { MutationFactcory, MutatorIF, MutatorMap, Cacheable, EngineIF, EngineValidatorFn, TreeIF } from "../types";
export type DataEngineParams = {
    cacheable?: Cacheable;
    validator?: EngineValidatorFn;
};
export default class DataEngine implements EngineIF {
    name: string;
    constructor(name: string, params?: DataEngineParams);
    actions: MutatorMap;
    validator?: EngineValidatorFn;
    tree?: TreeIF;
    private cacheable?;
    addAction(actOrActFactory: MutatorIF | MutationFactcory): DataEngine;
}
