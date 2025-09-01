export declare const FormEnum: {
    scalar: string;
    array: string;
    map: string;
    object: string;
    set: string;
    function: string;
    container: string;
    void: string;
};
type FormEnumKeys = keyof typeof FormEnum;
export type FormEnumType = (typeof FormEnum)[FormEnumKeys];
export declare const TypeofEnum: {
    undefined: string;
    object: string;
    boolean: string;
    number: string;
    bigint: string;
    string: string;
    symbol: string;
    function: string;
};
export declare const NumberEnum: {
    infinite: string;
    nan: string;
    integer: string;
    decimal: string;
};
type NumberEnumKeys = keyof typeof NumberEnum;
export type NumberEnumType = (typeof NumberEnum)[NumberEnumKeys];
export declare const TypeEnum: {
    string: string;
    number: string;
    boolean: string;
    symbol: string;
    array: string;
    map: string;
    object: string;
    set: string;
    null: string;
    undefined: string;
    function: string;
};
type TypeEnumKeys = keyof typeof TypeEnum;
export type TypeEnumType = (typeof TypeEnum)[TypeEnumKeys];
export {};
