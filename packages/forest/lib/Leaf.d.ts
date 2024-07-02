import { LeafIF, LeafParams } from "./types";
export declare class Leaf implements LeafIF {
    constructor(params: LeafParams);
    readonly val: unknown;
    readonly key: unknown;
    readonly treeName: string;
    get hasValue(): boolean;
}
