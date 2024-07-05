import { isObj } from './isObj';
import { isString } from './isString';
import { ChangeBase } from '../types';
import { isChangeType } from './isChangeType';

export function isChangeIF(arg: unknown): arg is ChangeBase<unknown, unknown> {
  if (!isObj(arg)) {return false;}
  const o = arg as Record<string, unknown>;

  if (!isChangeType(o.type)) {return false;}
  return ('key' in o || 'val' in o || 'data' in o );

}
