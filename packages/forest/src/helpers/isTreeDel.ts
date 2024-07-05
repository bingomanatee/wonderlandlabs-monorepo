import { isChangeIF } from './isChangeIF';
import { ChangeDel } from '../types';
import { ChangeTypeEnum } from './enums';

export function isTreeDel(a: unknown): a is ChangeDel {
  if (!isChangeIF(a)) {return false;}
  return a.type === ChangeTypeEnum.del;
}
