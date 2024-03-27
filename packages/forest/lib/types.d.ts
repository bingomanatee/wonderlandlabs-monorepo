export type Obj = Record<string, unknown>;
export declare function isObj(x: unknown): x is Obj;
export interface ForestIF {
    createBranch(config: Partial<BranchConfig>, name?: string): BranchIF;
    branches: Map<string, BranchIF>;
}
export type LeafConfig = Obj & {
    type?: string;
};
export declare function isLeafConfig(x: unknown): x is LeafConfig;
export declare function isLeafIF(x: unknown): x is LeafIF;
export interface BranchIF {
    name: string;
    readonly value: unknown;
    leaves?: Map<string, LeafIF>;
    get(key: string): unknown;
}
export type BranchConfig = Obj & {
    name: string;
    $value: unknown;
    leaves?: Record<string, LeafConfig>;
};
export declare function isBranchConfig(x: unknown): x is BranchConfig;
export interface LeafIF {
    value: unknown;
}
