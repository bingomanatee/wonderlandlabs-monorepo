import { BehaviorSubject } from 'rxjs';
import { LeafObj, LeafOpts, Tree } from './types';
export declare class Leaf<ValueType> implements LeafObj<ValueType> {
    $options: LeafOpts;
    $parent?: LeafObj<any> | undefined;
    constructor(value: ValueType, $options: LeafOpts, $parent?: LeafObj<any> | undefined);
    $id: string;
    $tree: Tree;
    $subject: BehaviorSubject<ValueType>;
    get $value(): ValueType;
    private $_composedSubject?;
    get $composedSubject(): BehaviorSubject<ValueType>;
    set $value(newValue: ValueType);
    $children?: Map<KeyType, LeafObj<any>>;
    $addChild(key: any, leaf: LeafObj<any>): void;
    /**
     * updated every time the child collection changes.
     */
    private $__childSubject?;
    private get $_childSubject();
    $child(key: any): any;
    $complete(): void;
    $blockUpdateToChildren: boolean;
    $blockUpdateToParent: boolean;
}
