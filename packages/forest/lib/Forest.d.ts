import { BehaviorSubject } from "rxjs";
import { ATIDs, DataEngineFactory, DataEngineIF, DataEngineName, DoErrorIF, ForestIF, TransactFn, TreeIF, TreeName, TreeSeed } from "./types";
export type DataEngineFactoryOrEngine = DataEngineIF | DataEngineFactory;
type EngineArgs = DataEngineName | DataEngineFactoryOrEngine;
export default class Forest implements ForestIF {
    constructor(engines: DataEngineFactoryOrEngine[]);
    readonly errors: DoErrorIF[];
    private trees;
    private engines;
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    dataEngine(nameOrEngine: EngineArgs, tree?: TreeIF): DataEngineIF;
    private _nextID;
    get nextID(): number;
    activeTransactionIds: BehaviorSubject<ATIDs>;
    private changeActiveTransactionIDs;
    transact(fn: TransactFn): unknown;
}
export {};
