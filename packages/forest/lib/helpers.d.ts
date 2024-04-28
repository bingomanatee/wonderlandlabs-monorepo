import { BranchConfig, ChildConfigs, LeafConfig, LeafIF, Obj } from './types';
export declare function isObj(x: unknown): x is Obj;
export declare function isLeafConfig(x: unknown): x is LeafConfig;
export declare function isLeafIF(x: unknown): x is LeafIF;
export declare function isBranchConfig(x: unknown): x is BranchConfig;
export declare function isChildConfigs(x: unknown): x is ChildConfigs;
