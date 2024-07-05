import { Change, ChangeTypeEnumValues } from "./enums";

export function isChangeType(arg: unknown): arg is Change {
  return typeof arg === "symbol" && ChangeTypeEnumValues.includes(arg);
}
