import { ActionFactory, ActionIF, ActionMap, Cacheable, DataEngineIF, DataEngineValidatorFn, TreeIF } from "../types";
export type DataEngineParams = {
    cacheable?: Cacheable;
    validator?: DataEngineValidatorFn;
};
export default class DataEngine implements DataEngineIF {
    name: string;
    constructor(name: string, params?: DataEngineParams);
    actions: ActionMap;
    validator?: DataEngineValidatorFn;
    tree?: TreeIF;
    private cacheable?;
    addAction(actOrActFactory: ActionIF | ActionFactory): DataEngine;
}
