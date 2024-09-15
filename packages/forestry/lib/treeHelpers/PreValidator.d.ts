import type { ChangeIF } from '../types/types.shared';
import type { TreeIF } from '../types/types.trees';
export declare class PreValidator {
    static validate<ValueType>(change: ChangeIF<ValueType>, tree: TreeIF<ValueType>): void;
}
