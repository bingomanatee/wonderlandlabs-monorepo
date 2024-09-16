import type { FieldIF, FieldError, FormCollectionIF } from './types.formCollection';
export declare function isString(field: FieldIF): {
    message: string;
    severity: number;
};
export declare const NO_EMPTY_CHARS = "must not have empty characters";
export declare function isSingleWord(field: FieldIF, errors: FieldError[]): {
    message: string;
    severity: number;
};
export declare const commonUserNames: string[];
export declare const IS_TOO_COMMON = "is too common";
export declare const IS_REQUIRED = "required";
export declare function isCommonUserName(field: FieldIF, errors: FieldError[]): {
    message: string;
    severity: number;
};
export declare function isRequired(field: FieldIF): {
    message: string;
    severity: number;
};
export declare const TOO_SHORT = "field must be 8 or more characters";
export declare function isLongEnough(field: FieldIF, errors: FieldError[]): {
    message: string;
    severity: number;
};
export declare const commonPasswords: string[];
export declare function isNotCommonPassword(field: FieldIF, errors: FieldError[]): {
    message: string;
};
export declare const makeFields: (values?: Record<string, string | number>) => Map<string, FieldIF>;
export declare const makeMockFormCollection: () => FormCollectionIF;
