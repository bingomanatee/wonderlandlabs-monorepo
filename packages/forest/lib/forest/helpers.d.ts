import { MultiTableChange, TableChangeBase, TableChangeField } from './types';
type Obj = Record<string | number | symbol, unknown>;
export declare function isObj(x: unknown): x is Obj;
/**
 * tests for "general case" TableChange = TableChangeField | TableChangeMultiField | TableChangeValue
 * @param x
 */
export declare function isTableChangeBase(x: unknown): x is TableChangeBase;
export declare function isTableChangeField(x: unknown): x is TableChangeField;
export declare function isForestChange(x: unknown): x is MultiTableChange;
export {};
