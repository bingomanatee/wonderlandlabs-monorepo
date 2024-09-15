import type { ForestIF } from '../../types/types.forest';
import type { SubscribeFn } from '../../types/types.shared';
import type { PartialObserver, Unsubscribable } from 'rxjs';
import type { FieldList, FieldRecord, FormSetIF, Params, FieldIF, BaseParamMap, FormCollectionIF, FieldMutatorFN } from './types.formCollection';
type FieldDef = FieldList | FieldRecord;
export default class FormCollection implements FormCollectionIF {
    name: string;
    constructor(name: string, fields: FieldDef, params?: Params);
    fieldBaseParams: BaseParamMap;
    forest: ForestIF;
    /**
     * interprets fields into a fieldMap.
     * @param {FieldDef} fields
     */
    private initFields;
    private fieldMapCollection;
    private form;
    private initForm;
    get value(): FormSetIF;
    private _stream?;
    private get stream();
    subscribe(observer: PartialObserver<FormSetIF> | SubscribeFn<FormSetIF>): Unsubscribable;
    hasField(name: string): boolean;
    field(name: string): FieldIF | undefined;
    setFieldValue(name: string, value: string | number): void;
    updateFieldProperty(name: string, key: string, value: any): void;
    updateField(name: string, mutator: FieldMutatorFN): void;
    commit(name?: string | true): void;
    get isValid(): boolean;
}
export {};
