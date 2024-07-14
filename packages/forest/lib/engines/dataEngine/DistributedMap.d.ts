import { BranchIF } from "../../types";
import { DataEngineMap } from "./dataEngineTypes";
/**
 * This is a datatype which is "mappish"
 * and keeps its field definitions distributed across
 * several branches' actions
 */
export declare class DistributedMap {
    branch: BranchIF;
    manifest: DistMapManifest;
    constructor(branch: BranchIF, manifest: DistMapManifest);
    has(key: unknown): boolean;
    keys(keys?: Set<unknown>): Set<unknown>;
    private _map?;
    clearCache(): void;
    get prevData(): DistributedMap | undefined;
    get nextData(): DistributedMap | undefined;
    map(map?: DataEngineMap): DataEngineMap;
    get(key: unknown): unknown;
}
