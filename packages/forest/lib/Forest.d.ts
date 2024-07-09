import { DataEngineIF, DataEngineName, ForestIF, TreeIF, TreeName, TreeSeed } from "./types";
export default class Forest implements ForestIF {
    constructor(engines: DataEngineIF[]);
    private trees;
    private engines;
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    dataEngine(nameOrEngine: DataEngineName | DataEngineIF): DataEngineIF;
}
