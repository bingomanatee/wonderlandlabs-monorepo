import { LeafIdentityIF } from '../types';
import { isObj } from './isObj';
import { isString } from './isString';

export function isLeafIdentityIF(a: unknown) : a is LeafIdentityIF {
  if (!isObj(a)) {return false;}
  const o = a as object;
  return  'treeName' in o && isString(o.treeName) && 'key' in o;
}