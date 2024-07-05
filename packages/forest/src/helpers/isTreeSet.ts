import { isChangeIF } from './isChangeIF';
import { ChangeSet } from './../types';
import { ChangeTypeEnum } from './enums';

export function isTreeSet(a: unknown): a is ChangeSet {
  if (!isChangeIF(a)) {return false;}
  return a.type === ChangeTypeEnum.set;
}
