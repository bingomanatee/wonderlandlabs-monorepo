import { LeafIF } from "./types";
import { LeafParams } from "./helpers/paramTypes";
/**
 * a Leaf is an "ANNOTATED VALUE from a tree." it includes its key (id),
 * and the name of the tree it came from. It is a readonly/transient value.
 */
export declare class Leaf implements LeafIF {
    constructor(params: LeafParams);
    readonly val: unknown;
    readonly key: unknown;
    readonly treeName: string;
    get hasValue(): boolean;
}
