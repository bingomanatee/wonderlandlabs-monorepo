import { BehaviorSubject } from "rxjs";
import { ATIDs, EngineFactory, EngineIF, EngineName, TransactionErrorIF, ForestIF, TransactFn, TreeIF, TreeName, TreeSeed } from "./types";
export type DataEngineFactoryOrEngine = EngineIF | EngineFactory;
type EngineArgs = EngineName | DataEngineFactoryOrEngine;
export default class Forest implements ForestIF {
    constructor(engines: DataEngineFactoryOrEngine[]);
    readonly errors: TransactionErrorIF[];
    private trees;
    private engines;
    tree(name: TreeName, seed?: TreeSeed): TreeIF;
    engine(nameOrEngine: EngineArgs, tree?: TreeIF): EngineIF;
    private _nextID;
    get nextID(): number;
    activeTransactionIds: BehaviorSubject<ATIDs>;
    private changeActiveTransactionIDs;
    transact(fn: TransactFn): unknown;
}
export {};
