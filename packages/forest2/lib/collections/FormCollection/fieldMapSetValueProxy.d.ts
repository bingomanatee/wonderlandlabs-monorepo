import type { FieldBase, FieldMap, FieldValue } from "./types.formCollection";
/**
 *
 * this is a proxy that returns values from the previous map EXCEPT for when you get the entry whose value has been changed
 * io which case you get the extenedField.
 *
 * @param map
 * @param name
 * @param value
 * @param basis
 * @returns
 */
export declare function fieldMapSetValueProxy(map: FieldMap, name: string, value: FieldValue, basis: FieldBase | undefined): Map<KeyType, ValueType>;
