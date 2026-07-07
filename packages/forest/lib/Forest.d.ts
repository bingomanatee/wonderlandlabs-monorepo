import { BehaviorSubject } from 'rxjs';
import { ATIDs, EngineFactory, EngineIF, EngineName, TransactionErrorIF, ForestIF, TransactFn, TreeIF, TreeName, TreeSeed } from './types';
export type DataEngineFactoryOrEngine = EngineIF | EngineFactory;
type EngineArgs<ValueType = unknown> = EngineName | EngineIF<ValueType> | EngineFactory;
export default class Forest implements ForestIF {
    constructor(engines: DataEngineFactoryOrEngine[]);
    readonly errors: TransactionErrorIF[];
    private trees;
    private engines;
    tree<ValueType>(name: TreeName, seed?: TreeSeed<ValueType>): TreeIF<ValueType>;
    engine<ValueType>(nameOrEngine: EngineArgs<ValueType>, tree?: TreeIF<ValueType>): EngineIF<ValueType>;
    private _nextID;
    get nextID(): number;
    activeTransactionIds: BehaviorSubject<ATIDs>;
    private changeActiveTransactionIDs;
    transact(fn: TransactFn): unknown;
}
export {};
