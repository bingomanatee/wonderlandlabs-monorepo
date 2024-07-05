import { ChangeType, ChangeTypeEnumValues } from './enums';


export function isChangeType(arg: unknown): arg is ChangeType {
  return typeof arg === 'symbol' && ChangeTypeEnumValues.includes(arg);
}
