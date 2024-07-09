import { BranchIF } from "../../types";
/**
 * a generic initializer; it returns a seed's initial value.
 * Some intitializers may validate their data.
 */
export declare const initializer: {
    name: string;
    delta(_: BranchIF, modifier: unknown): unknown;
};
