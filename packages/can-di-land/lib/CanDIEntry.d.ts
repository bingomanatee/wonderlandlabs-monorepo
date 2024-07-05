import { CanDiType, Key, Config, Value, ValueMap } from "./types";
export default class CanDIEntry {
  private can;
  key: Key;
  resource: Value;
  constructor(can: CanDiType, key: Key, config: Config, resource: Value);
  async: boolean;
  private args;
  deps: Key[];
  type: string;
  final: boolean;
  private stream;
  private _watchResource;
  private fnArgs;
  private depValues;
  private fn;
  computeFor(map: ValueMap): any;
  next(value: Value): void;
  get value(): any;
  transform(value: Value): any;
  /**
   * indicates whether this entry is open to being updated.
   */
  get active(): boolean;
  /**
   * whether this entry has all the deps it needs to allow its value to be added to the CanDI's map
   * As it is used in _updateComps, where the "next map" is detached and extensively preprocessed,
   * the "value map" is optionally passed in as a parameter;
   * in other situations, the can's `has(..)` method is sufficient.
   */
  resolved(map?: ValueMap): boolean;
  private _valueSent;
  /**
   * used in subscribing to this entries' stream
   */
  _onValue(value: Value): void;
  checkForLoop(subEntry?: CanDIEntry): void;
}
