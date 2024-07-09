import { DataEngineIF, DataEngineName, ForestIF, TreeIF, TreeName, TreeSeed } from "./types";


export class Forest implements ForestIF {
    private trees: Map<TreeName, TreeIF> = new Map();

    tree(name: TreeName, seed?: TreeSeed): TreeIF | undefined{
        if (!seed) return this.trees.get(name);
        if (this.trees.has(name)) throw new Error('cannot redefine tree ' + name);
        const newTree = new Tree(this, name, seed);
        this.trees.set(name, newTree);
        return newTree;
    }
    dataEngine(nameOrEngine: DataEngineName | DataEngineIF): DataEngineIF {
        throw new Error("Method not implemented.");
    }



}