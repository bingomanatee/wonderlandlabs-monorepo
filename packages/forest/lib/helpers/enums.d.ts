export declare const BranchActionEnum: {
    init: symbol;
    set: symbol;
    del: symbol;
    change: symbol;
    action: symbol;
    trans: symbol;
};
type BranchActionEnumKeys = keyof typeof BranchActionEnum;
export type BranchAction = (typeof BranchActionEnum)[BranchActionEnumKeys];
export declare const LeafValueEnum: {
    absent: symbol;
    pending: symbol;
};
type LeafValueEnumKeys = keyof typeof LeafValueEnum;
export type LeafValue<$V> = $V | (typeof LeafValueEnum)[LeafValueEnumKeys];
export declare const ChangeTypeEnum: {
    set: symbol;
    del: symbol;
    change: symbol;
    sets: symbol;
    changes: symbol;
    replace: symbol;
};
type ChangeTypeEnumKeys = keyof typeof ChangeTypeEnum;
export type ChangeType = (typeof ChangeTypeEnum)[ChangeTypeEnumKeys];
export declare const ChangeTypeEnumValues: Symbol[];
export declare const StatusEnum: {
    good: symbol;
    bad: symbol;
    pending: symbol;
};
type StatusEnumKeys = keyof typeof StatusEnum;
export type Status = (typeof StatusEnum)[StatusEnumKeys];
export {};
