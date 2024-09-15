import { EngineIF, TreeIF } from "../types";
export declare const engineMap: {
    name: string;
    factory(tree: TreeIF): EngineIF;
};
