import { BehaviorSubject } from 'rxjs';
import { Schema } from './Schema';
import { TypeEnum } from '@wonderlandlabs/walrus/dist/enums';
export type LeafId = string;
export interface LeafObj<ValueType> {
    $value: ValueType;
    $id: string;
    $subject: BehaviorSubject<ValueType>;
    $composedSubject: BehaviorSubject<ValueType>;
    $child(key: any): LeafObj<any> | undefined;
    $children?: Map<any, LeafObj<any>>;
    $options: LeafOpts;
    $tree: Tree;
    $complete(): void;
    $blockUpdateToChildren: boolean;
    $blockUpdateToParent: boolean;
    $parent?: LeafObj<any>;
    $parentField?: any;
}
export type LeafOpts = {
    name?: string;
    fields?: Schema[];
};
export interface Tree {
    addLeaf(leaf: LeafObj<any>): void;
    value(id: LeafId): any;
    update(id: LeafId, value: any): void;
}
type ValidatorFn = (value: any) => any;
export type SchemaPropsInput = {
    notes?: string;
    $type: TypeEnum | 'any';
    key?: any;
    valueType?: TypeEnum;
    keyType?: TypeEnum;
    test?: ValidatorFn;
    defaultValue?: any;
    fields?: Schema[] | Record<string, SchemaPropsInput>;
} & ({
    name: string;
    typescriptName?: string;
} | {
    typescriptName: string;
    name: string;
});
export type SchemaProps = SchemaPropsInput & {
    fields: Schema[];
};
export {};
