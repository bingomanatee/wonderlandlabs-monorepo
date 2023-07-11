import { CanDiType, Key, Config, Value } from './types';
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
    private get fnArgs();
    private fn;
    next(value: Value): void;
    get value(): any;
    transform(value: Value): any;
    private _valueSent;
    _onValue(value: Value): void;
}
