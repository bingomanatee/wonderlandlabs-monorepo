import { MutationValidatorIF, TreeValidator } from "./types";
export declare class ValidatorError extends Error {
    constructor(err: Error | string | unknown, val: TreeValidator | MutationValidatorIF, mutation?: string);
    readonly name: string;
    mutation?: string;
}
