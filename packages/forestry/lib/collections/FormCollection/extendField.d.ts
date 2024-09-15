import type { FieldIF } from './types.formCollection';
type Param = Partial<FieldIF> | undefined | Param[];
/**
 *
 * @param  fields passed arrays or individual FieldIFs; may have undefined.
 * passed in most recent to least recent.
 * returns an array favoring more recent values.
 */
export default function extendField(...fields: Param[]): FieldIF;
export {};
