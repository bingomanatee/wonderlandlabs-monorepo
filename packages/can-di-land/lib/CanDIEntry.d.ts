import { CanDiType, Key, Config, Value, ValueMap } from './types';
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
    get active(): boolean;
    resolved(map?: ValueMap): boolean;
    private _valueSent;
    _onValue(value: Value): void;
}
