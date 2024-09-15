import { DataEngineIF, TreeIF } from "../types";
export declare const dataEngineMap: {
    name: string;
    factory(tree: TreeIF): DataEngineIF;
};
