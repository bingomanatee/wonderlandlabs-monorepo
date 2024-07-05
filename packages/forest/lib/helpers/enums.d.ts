export declare const Aciion_s: {
    init: symbol;
    set: symbol;
    del: symbol;
    change: symbol;
    action: symbol;
    trans: symbol;
};
type ActionEnumKeys = keyof typeof Aciion_s;
export type Action = typeof Aciion_s[ActionEnumKeys];
export declare const LeafValue_s: {
    absent: symbol;
    pending: symbol;
};
type LeafValueEnumKeys = keyof typeof LeafValue_s;
export type LeafValue<$V> = $V | typeof LeafValue_s[LeafValueEnumKeys];
export declare const Change_s: {
    set: symbol;
    del: symbol;
    change: symbol;
    sets: symbol;
    changes: symbol;
    replace: symbol;
};
type ChangeKeys = keyof typeof Change_s;
export type Change = typeof Change_s[ChangeKeys];
export declare const ChangeTypeEnumValues: symbol[];
export declare const Status_s: {
    good: symbol;
    bad: symbol;
    pending: symbol;
};
type StatusKeys = keyof typeof Status_s;
export type Status = typeof Status_s[StatusKeys];
export {};
