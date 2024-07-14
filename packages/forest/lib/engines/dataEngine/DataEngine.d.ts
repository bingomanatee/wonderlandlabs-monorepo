import { ActionIF, ActionMap, DataEngineIF, DataEngineValidatorFn, TreeIF } from "../../types";
type ActionFactory = (engine: DataEngineIF) => ActionIF;
export default class DataEngine implements DataEngineIF {
    name: string;
    validator?: DataEngineValidatorFn | undefined;
    constructor(name: string, validator?: DataEngineValidatorFn | undefined);
    actions: ActionMap;
    tree?: TreeIF;
    addAction(actOrActFactory: ActionIF | ActionFactory): DataEngine;
}
export {};
