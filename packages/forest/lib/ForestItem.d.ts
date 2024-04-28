import { ForestId, ForestIF, ForestItemIF, ForestItemTestFn, TransID, TransIF, TransValue, UpdateDirType } from './types';
import { BehaviorSubject, Observer, Subscription } from 'rxjs';
/**
 * This is an "abstract class" - its used as a basis for other classes.
 */
export default class ForestItem implements ForestItemIF {
    readonly name: string;
    forest: ForestIF;
    forestId: ForestId;
    constructor(name: string, value: unknown, forest: ForestIF);
    protected registerInForest(): void;
    test?: ForestItemTestFn;
    observable: BehaviorSubject<unknown>;
    /**
     * This is the _last valid value_ of the branch. note - the first value of the branch
     * is "assumed to be valid" though it may indeed have errors based on leafs etc.
     *
     * This is used among other things to prevent the type of the branch to switch based on updates;
     * that is you can't update the value of a branch<Array> with an object or vice versa.
     */
    get committedValue(): unknown;
    subscribe(observer: Observer<unknown>): Subscription;
    set value(newValue: unknown);
    get value(): unknown;
    commit(): void;
    flushTemp(): void;
    get hasTempValues(): boolean;
    report(): {
        id: string;
        name: string;
        obsValue: unknown;
        tempValues: TransValue[];
    };
    change(trans: TransIF, value: unknown): void;
    reflectPendingValue(_id: TransID, _direction?: UpdateDirType): void;
    private tempValues;
    pushTempValue(value: unknown, id: TransID): void;
    validate(): void;
    private removeTempValues;
    do: {};
}
