import { DataEngineFactory, DataEngineIF, DataEngineName, ForestIF, TreeIF, TreeName, TreeSeed } from "./types";
type EngineArgs = DataEngineName | DataEngineIF | DataEngineFactory;
export default class Forest implements ForestIF {
    constructor(engines: EngineArgs[]);
    private trees;
    private engines;
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    dataEngine(nameOrEngine: EngineArgs, tree?: TreeIF): DataEngineIF;
}
export {};
